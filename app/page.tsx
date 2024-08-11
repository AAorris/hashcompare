import Chart from "./data-chart";
import { AppContextProvider } from "./app-context";

export default function Home() {
	const colors = ["#8884d8", "#82ca9d"];
	return (
		<AppContextProvider>
			<div className="grid grid-cols-2 gap-4 mt-4">
				<Chart hashFunction="xxhash" color={colors[0]} />
				<Chart hashFunction="fnv1a" color={colors[1]} />
				{/* <Chart hashFunction="simpleHash" /> */}
			</div>
		</AppContextProvider>
	);
}
