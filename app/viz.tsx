import type React from "react";
import {
	LineChart,
	Line,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	Legend,
	ResponsiveContainer,
} from "recharts";

interface VisualizationProps {
	data: {
		iteration: number;
		chiSquaredValues: { [key: string]: number };
	}[];
}

export const Visualization: React.FC<VisualizationProps> = ({ data }) => {
	const chartData = data.map((item) => {
		return {
			iteration: item.iteration,
			...item.chiSquaredValues,
		};
	});

	return (
		<ResponsiveContainer width="100%" height={500}>
			<LineChart
				data={chartData}
				margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
			>
				<CartesianGrid strokeDasharray="3 3" />
				<XAxis dataKey="iteration" />
				<YAxis />
				<Tooltip />
				<Legend />
				{data[0]
					? Object.keys(data[0].chiSquaredValues).map((hashName) => (
							<Line
								key={hashName}
								type="monotone"
								dataKey={hashName}
								stroke={`#${Math.floor(Math.random() * 16777215).toString(16)}`}
								activeDot={{ r: 8 }}
							/>
						))
					: null}
			</LineChart>
		</ResponsiveContainer>
	);
};
