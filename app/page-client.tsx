"use client";
import React, { useState, useEffect } from "react";
import { xxHash32 } from "js-xxhash";
import { Visualization } from "./viz";

const FNV_PRIME_32 = 16_777_619n;
const FNV_OFFSET_32 = 2_166_136_261n;

/**
 * Simplified FNV-1a Hash Function
 */
export function fnv1a(s: string): number {
	let hash = FNV_OFFSET_32;
	for (let i = 0; i < s.length; i++) {
		/* eslint-disable-next-line no-bitwise */
		hash ^= BigInt(s.charCodeAt(i));
		hash = BigInt.asUintN(32, hash * FNV_PRIME_32);
	}
	return Number(hash);
}

interface HashResult {
	iteration: number;
	chiSquaredValues: { [key: string]: number };
}

const numBuckets = 2;
const totalIterations = 300_000;
const iterationStep = 1000;

const hashFunctions = {
	FNV1a: (id: string) => fnv1a(id) % numBuckets,
	xxHash32: (id: string) => xxHash32(Buffer.from(id), 0xabcd) % numBuckets,
};

function calculateChiSquared(buckets: number[], expectedCount: number): number {
	return buckets.reduce((chiSquared, observed) => {
		const diff = observed - expectedCount;
		return chiSquared + (diff * diff) / expectedCount;
	}, 0);
}

const App: React.FC = () => {
	const [data, setData] = useState<HashResult[]>([]);

	useEffect(() => {
		const generatedData: HashResult[] = [];
		const cumulativeBuckets: { [key: string]: number[] } = {};

		Object.keys(hashFunctions).forEach((hashName) => {
			cumulativeBuckets[hashName] = Array(numBuckets).fill(0);
		});

		for (let i = 1; i <= totalIterations; i++) {
			const userId = crypto.randomUUID(); // Use crypto.randomUUID for client-side UUID generation

			Object.keys(hashFunctions).forEach((hashName) => {
				const bucket = hashFunctions[hashName](userId);
				cumulativeBuckets[hashName][bucket]++;
			});

			if (i % iterationStep === 0) {
				const chiSquaredValues: { [key: string]: number } = {};

				Object.keys(hashFunctions).forEach((hashName) => {
					const expectedCount = i / numBuckets;
					chiSquaredValues[hashName] = calculateChiSquared(
						cumulativeBuckets[hashName],
						expectedCount,
					);
				});

				generatedData.push({
					iteration: i,
					chiSquaredValues,
				});
			}
		}

		setData(generatedData);
	}, []);

	return (
		<div>
			<h1>Hash Function Chi-Squared Visualization</h1>
			<Visualization data={data} />
		</div>
	);
};

export default App;
