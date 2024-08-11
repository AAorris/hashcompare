"use client";

import {
	highestProbability,
	probabilityArea,
	probabilityDensity,
} from "@/lib/beta";
import { useMemo } from "react";
import {
	Area,
	AreaChart,
	ReferenceArea,
	ReferenceLine,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";

interface Props {
	config?: Record<string, [number, number]>;
	colors: string[];
	increment: number;
	confidence: number;
}

export function BetaChart({ config, colors, increment, confidence }: Props) {
	const data = useMemo(() => {
		if (!config) return [];

		const result = [];
		const variants = Object.keys(config);
		for (let x = 0; x <= 1; x += increment) {
			const item: Record<string, number> = { x };
			let hasSignificantDensity = false;
			for (const variant of variants) {
				const [alpha, beta] = config[variant];
				item[variant] = probabilityDensity([alpha, beta], x);
				if (item[variant] > 0.01) hasSignificantDensity = true;
			}
			if (hasSignificantDensity) {
				result.push(item);
			}
		}

		return result;
	}, [increment, config]);

	const variants = useMemo(
		() => Object.keys(config ?? {}).sort((a, b) => a.localeCompare(b)),
		[config],
	);
	try {
		console.log(probabilityArea(config![variants[0]], confidence));
	} catch (e) {
		void 1;
	}

	return (
		<div>
			<ResponsiveContainer width={"100%"} height={400}>
				<AreaChart key="beta" data={data}>
					<defs>
						{colors.map((color, idx) => (
							<linearGradient
								key={color}
								id={`color${idx}`}
								x1="0"
								y1="0"
								x2="0"
								y2="1"
							>
								<stop offset="5%" stopColor={color} stopOpacity={1} />
								<stop offset="70%" stopColor={color} stopOpacity={0.8} />
								<stop offset="100%" stopColor={color} stopOpacity={0} />
							</linearGradient>
						))}
					</defs>
					<XAxis
						type="number"
						dataKey="x"
						color="white"
						tickCount={4}
						tickFormatter={(v) => `${(v * 100).toFixed(2)}%`}
						domain={[0.7, 1]}
					/>
					{variants.map((variant, idx) => (
						<ReferenceArea
							key={`${variant}-area`}
							// className={"hover"}
							{...probabilityArea(config![variant], confidence)}
							ifOverflow="extendDomain"
							isFront={true}
							opacity={0.5}
							strokeWidth={2}
							fill={colors[idx]}
							fillOpacity={0.15}
							stroke={colors[idx]}
							strokeOpacity={0.4}
							strokeDasharray={"4"}
						/>
					))}
					{config &&
						variants.map((variant, idx) => (
							<Area
								key={`${variant}-area-monotone`}
								type="monotone"
								dataKey={variant}
								connectNulls={false}
								fillOpacity={0.15}
								stroke={colors[idx]}
								strokeWidth={2}
								fill={`url(#color${idx})`}
							/>
						))}
					<Tooltip
						content={({ active, payload, label }) => {
							if (active && payload && payload.length) {
								return (
									<div
										style={{
											background: "var(--g1)",
											height: "100%",
											outline: "none",
											padding: 30,
										}}
									>
										<p style={{ margin: 0, paddingBottom: 10 }}>
											{Math.round(label * 100)}%
										</p>
										{payload
											.sort(
												(a, b) =>
													((b.value as number | undefined) ?? 0) -
													((a.value as number | undefined) ?? 0),
											)
											.map((item, idx) => (
												<p
													key={item.dataKey ?? idx}
													style={{ color: item.color, margin: 0 }}
												>
													{`${item.dataKey}: ${(item.value as number | undefined)?.toFixed(3)}`}
												</p>
											))}
									</div>
								);
							}

							return null;
						}}
					/>
				</AreaChart>
			</ResponsiveContainer>
		</div>
	);
}

export default BetaChart;
