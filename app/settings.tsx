"use client";
import type React from "react";
import { createContext, useState, useContext } from "react";
import {
	Card,
	CardHeader,
	CardTitle,
	CardDescription,
	CardContent,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

// Define the shape of our settings
interface HashSettings {
	buckets: number;
	samples: number;
}

// Create a context for our settings
const HashSettingsContext = createContext<HashSettings | undefined>(undefined);

// Custom hook to use our settings
export const useHashSettings = () => {
	const context = useContext(HashSettingsContext);
	if (context === undefined) {
		throw new Error(
			"useHashSettings must be used within a HashSettingsProvider",
		);
	}
	return context;
};

interface HashSettingsProviderProps {
	children: React.ReactNode;
}

export function HashSettingsProvider({ children }: HashSettingsProviderProps) {
	const [buckets, setBuckets] = useState(10);
	const [samples, setSamples] = useState(1000);
	const [key, setKey] = useState(0);

	const regenerate = () => {
		setKey((prevKey) => prevKey + 1);
	};

	return (
		<Card className="w-full max-w-[95vw] mx-auto">
			<CardHeader>
				<CardTitle>Hash Distribution Settings</CardTitle>
				<CardDescription>
					Configure the parameters for hash distribution analysis
				</CardDescription>
			</CardHeader>
			<CardContent>
				<div className="grid grid-cols-2 gap-4 mb-4">
					<div>
						<Label htmlFor="buckets">Number of Buckets</Label>
						<Input
							id="buckets"
							type="number"
							value={buckets}
							onChange={(e) =>
								setBuckets(Math.max(1, Number.parseInt(e.target.value)))
							}
							min="1"
						/>
					</div>
					<div>
						<Label htmlFor="samples">Number of Samples</Label>
						<Input
							id="samples"
							type="number"
							value={samples}
							onChange={(e) =>
								setSamples(Math.max(1, Number.parseInt(e.target.value)))
							}
							min="1"
						/>
					</div>
				</div>
				<Button onClick={regenerate} className="w-full">
					Regenerate
				</Button>
				<HashSettingsContext.Provider value={{ buckets, samples }}>
					<div key={key}>{children}</div>
				</HashSettingsContext.Provider>
			</CardContent>
		</Card>
	);
}
