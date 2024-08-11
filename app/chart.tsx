"use client";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { xxHash32 } from "js-xxhash";
import React, { useState, useEffect, useRef, useMemo } from "react";
import {
	Bar,
	BarChart,
	CartesianGrid,
	Legend,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";
import { useHashSettings } from "./settings";

const FNV_PRIME_32 = 16_777_619n;
const FNV_OFFSET_32 = 2_166_136_261n;

/**
 * Much simplified version of https://github.com/sindresorhus/fnv1a
 * @see http://www.isthe.com/chongo/tech/comp/fnv/index.html
 * @see https://en.wikipedia.org/wiki/Fowler%E2%80%93Noll%E2%80%93Vo_hash_function
 * @see https://softwareengineering.stackexchange.com/a/145633
 */
export function fnv1a(s: string): number {
	let hash = FNV_OFFSET_32;
	for (let i = 0; i < s.length; i++) {
		/* eslint-disable-next-line no-bitwise -- TODO: Fix ESLint Error (#13355) */
		hash ^= BigInt(s.charCodeAt(i));
		// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/BigInt/asUintN
		// Returns the value of bigint modulo 2^bits, as an unsigned integer.
		hash = BigInt.asUintN(32, hash * FNV_PRIME_32);
	}
	return Number(hash);
}

function kolmogorovSmirnovUniformTest(
	buckets: number[],
	expectedCount: number,
): boolean {
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

	const criticalValue = 1.36 / Math.sqrt(n);

	return dMax <= criticalValue;
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
}) {
	const settings = useHashSettings();
	const [distribution, setDistribution] = useState<number[]>([]);
	const [testValue, setTestValue] = useState(false);
	const testBetaDistribution = useRef<{ alpha: number; beta: number }>({
		alpha: 0,
		beta: 0,
	});

	useEffect(() => {
		const runSimulation = () => {
			const counts = new Array(settings.buckets).fill(0);

			for (let i = 0; i < settings.samples; i++) {
				const uuid = crypto.randomUUID();
				const bucketIndex =
					hashFunctions[props.hashFunction as keyof typeof hashFunctions](
						uuid,
					) % settings.buckets;
				counts[bucketIndex]++;
			}

			setDistribution(counts);

			// const expected = settings.samples / settings.buckets;
			// const chiSquaredValue = calculateChiSquared(counts, expected);
			const isUniform = kolmogorovSmirnovUniformTest(counts, settings.samples);
			setTestValue(isUniform);
			testBetaDistribution.current[isUniform ? "alpha" : "beta"]++;
		};

		runSimulation();
	}, [props, settings]);

	const chartData = distribution.map((count, index) => ({
		bucket: `Bucket ${index}`,
		count: count,
	}));

	return (
		<Card className="w-full max-w-3xl mx-auto">
			<CardHeader>
				<CardTitle>
					<code>{props.hashFunction}</code> Distribution Chart{" "}
					<code>
						{testBetaDistribution.current.alpha}/
						{testBetaDistribution.current.beta}
					</code>
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
					<Bar dataKey="count" fill="#8884d8" />
				</BarChart>
				<div className="mt-4 text-center">
					<p>
						{testValue
							? "The distribution appears to be uniform (uniformity test pass)."
							: "The distribution may not be uniform (uniformity test fail)."}
					</p>
				</div>
			</CardContent>
		</Card>
	);
}
