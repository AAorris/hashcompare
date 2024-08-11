import Chart from "./chart";
import { HashSettingsProvider } from "./settings";

export default function Home() {
	return (
		<HashSettingsProvider>
			<div className="grid grid-cols-2 gap-4 mt-4">
				<Chart hashFunction="xxhash" />
				<Chart hashFunction="fnv1a" />
				{/* <Chart hashFunction="simpleHash" /> */}
			</div>
		</HashSettingsProvider>
	);
}
