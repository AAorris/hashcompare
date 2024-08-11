"use client";

import React, { useState, useEffect, useRef } from "react";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Bar,
	BarChart,
	CartesianGrid,
	Legend,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";
import { useAppContext } from "./app-context";
import { xxHash32 } from "js-xxhash";
import { SquareAsterisk } from "lucide-react";

const FNV_PRIME_32 = 16_777_619n;
const FNV_OFFSET_32 = 2_166_136_261n;

export function fnv1a(s: string): number {
	let hash = FNV_OFFSET_32;
	for (let i = 0; i < s.length; i++) {
		hash ^= BigInt(s.charCodeAt(i));
		hash = BigInt.asUintN(32, hash * FNV_PRIME_32);
	}
	return Number(hash);
}

function kolmogorovSmirnovUniformTest(
	buckets: number[],
	expectedCount: number,
): number {
	const n = buckets.reduce((sum, count) => sum + count, 0);
	const ecdf = buckets.map(
		(count, index) =>
			buckets.slice(0, index + 1).reduce((sum, count) => sum + count, 0) / n,
	);

	const uniformCdf = (i: number) => (i + 1) / buckets.length;
	const dMax = ecdf.reduce((maxD, ecdfValue, index) => {
		const uniformCdfValue = uniformCdf(index);
		const d = Math.abs(ecdfValue - uniformCdfValue);
		return Math.max(maxD, d);
	}, 0);

	return dMax;
}

const simpleHash = (str: string) => {
	let hash = 0;
	for (let i = 0; i < str.length; i++) {
		hash = (hash << 5) - hash + str.charCodeAt(i);
		hash = hash & hash;
	}
	return Math.abs(hash);
};

const calculateChiSquared = (observed: number[], expected: number) => {
	return observed.reduce(
		(sum, count) => sum + (count - expected) ** 2 / expected,
		0,
	);
};

const hashFunctions = {
	xxhash: xxHash32,
	fnv1a: fnv1a,
	simpleHash: simpleHash,
};

export default function Component(props: {
	hashFunction: string;
	color: string;
}) {
	const appContext = useAppContext();
	const [distribution, setDistribution] = useState<number[]>([]);
	const [ksStatistic, setKsStatistic] = useState<number>(0);
	const [chiSquared, setChiSquared] = useState<number>(0);
	const [testsPassed, setTestsPassed] = useState<number>(0);
	const [totalTests, setTotalTests] = useState<number>(0);
	const betaDistribution = useRef<{ alpha: number; beta: number }>({
		alpha: 1,
		beta: 1,
	});

	useEffect(() => {
		const runSimulation = () => {
			const counts = new Array(appContext.buckets).fill(0);

			for (let i = 0; i < appContext.samples; i++) {
				const uuid = crypto.randomUUID();
				const bucketIndex =
					hashFunctions[props.hashFunction as keyof typeof hashFunctions](
						uuid,
					) % appContext.buckets;
				counts[bucketIndex]++;
			}

			setDistribution(counts);

			const expected = appContext.samples / appContext.buckets;
			const chiSquaredValue = calculateChiSquared(counts, expected);
			setChiSquared(chiSquaredValue);

			const chiSquaredPass = chiSquaredValue <= appContext.buckets;

			const ksValue = kolmogorovSmirnovUniformTest(counts, expected);
			setKsStatistic(ksValue);

			const criticalValue = 1.36 / Math.sqrt(appContext.samples);
			const ksPass = ksValue <= criticalValue;

			const isUniform = chiSquaredPass && ksPass;

			setTestsPassed((prev) => prev + (isUniform ? 1 : 0));
			setTotalTests((prev) => prev + 1);

			betaDistribution.current.alpha += isUniform ? 1 : 0;
			betaDistribution.current.beta += isUniform ? 0 : 1;

			appContext.setBetaDistributions((prev) => ({
				...prev,
				[props.hashFunction]: [
					betaDistribution.current.alpha,
					betaDistribution.current.beta,
				],
			}));
		};

		runSimulation();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [props.hashFunction, appContext.buckets, appContext.samples]);

	const chartData = distribution.map((count, index) => ({
		bucket: `Bucket ${index}`,
		count: count,
	}));

	return (
		<Card className="w-full max-w-3xl mx-auto">
			<CardHeader>
				<CardTitle>
					<code>{props.hashFunction}</code>
				</CardTitle>
				<CardDescription>
					Visualizing hash function distribution and uniformity
				</CardDescription>
			</CardHeader>
			<CardContent>
				<BarChart width={600} height={300} data={chartData} className="mx-auto">
					<CartesianGrid strokeDasharray="3 3" />
					<XAxis dataKey="bucket" />
					<YAxis />
					<Tooltip />
					<Legend />
					<Bar dataKey="count" fill={props.color} />
				</BarChart>
				<div className="mt-4 flex flex-col items-center">
					<p className="flex items-center gap-1">
						<SquareAsterisk
							size={16}
							color={
								ksStatistic <= 1.36 / Math.sqrt(appContext.samples)
									? "#004aff"
									: "#ff4a00"
							}
						/>
						<span>Kolmogorov-Smirnov statistic: {ksStatistic.toFixed(4)}</span>
					</p>
					<p className="flex items-center gap-1">
						<SquareAsterisk
							size={16}
							color={chiSquared <= appContext.buckets ? "#004aff" : "#ff4a00"}
						/>
						<span>Chi-squared statistic: {chiSquared.toFixed(4)}</span>
					</p>
					<p className="flex items-center gap-1">
						<span>
							Tests passed: {testsPassed} / {totalTests} (
							{((testsPassed / totalTests) * 100).toFixed(2)}%)
						</span>
					</p>
				</div>
			</CardContent>
		</Card>
	);
}
