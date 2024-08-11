"use client";
import type React from "react";
import { createContext, useState, useContext, Dispatch } from "react";
import {
	Card,
	CardHeader,
	CardTitle,
	CardDescription,
	CardContent,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import BetaChart from "./beta-chart";

// Define the shape of our settings
interface AppContextData {
	buckets: number;
	samples: number;
	setBetaDistributions: Dispatch<
		React.SetStateAction<Record<string, [number, number]>>
	>;
}

// Create a context for our settings
const AppContext = createContext<AppContextData | undefined>(undefined);

// Custom hook to use our settings
export const useAppContext = () => {
	const context = useContext(AppContext);
	if (context === undefined) {
		throw new Error(
			"useHashSettings must be used within a HashSettingsProvider",
		);
	}
	return context;
};

interface AppContextProviderProps {
	children: React.ReactNode;
}

export function AppContextProvider({ children }: AppContextProviderProps) {
	const [buckets, setBuckets] = useState(10);
	const [samples, setSamples] = useState(1000);
	const [betaDistributions, setBetaDistributions] = useState<
		Record<string, [number, number]>
	>({});
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
				<AppContext.Provider value={{ buckets, samples, setBetaDistributions }}>
					<div>{children}</div>
				</AppContext.Provider>
				<div className="mt-4">
					<h3 className="text-lg font-semibold mb-2">
						Beta Distribution of KS Test Results
					</h3>
					<BetaChart
						config={betaDistributions}
						colors={["#8884d8", "#82ca9d"]}
						increment={0.01}
						confidence={0.95}
					/>
				</div>
			</CardContent>
		</Card>
	);
}
