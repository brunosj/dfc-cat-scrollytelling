const actual = [
	{ year: 1990, emissions: 1242, ymin: 1242, ymax: 1242 },
	{ year: 1995, emissions: 1115, ymin: 1115, ymax: 1115 },
	{ year: 2000, emissions: 1037, ymin: 1037, ymax: 1037 },
	{ year: 2005, emissions: 987, ymin: 987, ymax: 987 },
	{ year: 2010, emissions: 936, ymin: 936, ymax: 936 },
	{ year: 2015, emissions: 898, ymin: 898, ymax: 898 },
	{ year: 2020, emissions: 729, ymin: 729, ymax: 729 }
];

const future = [
	{year: 2020, ymin: 729, ymax: 729, temp: "4+"},
	{year: 2020, ymin: 729, ymax: 729, temp: "4"},
	{year: 2020, ymin: 729, ymax: 729, temp: "3"},
	{year: 2020, ymin: 729, ymax: 729, temp: "2"},
	{year: 2020, ymin: 729, ymax: 729, temp: "1.5"},
    {year: 2025, ymin: 869.0333659, ymax: 1052.3889556, temp: "4+"},
    {year: 2030, ymin: 851.5365277, ymax: 1107.3836309, temp: "4+"},
    {year: 2025, ymin: 818.2960234, ymax: 869.0333659, temp: "4"},
    {year: 2030, ymin: 708.354109, ymax: 851.5365277, temp: "4"},
    {year: 2025, ymin: 722.4397082, ymax: 818.2960234, temp: "3"},
    {year: 2030, ymin: 612.3909341, ymax: 708.354109, temp: "3"},
    {year: 2025, ymin: 591.3251527, ymax: 722.4397082, temp: "2"},
    {year: 2030, ymin: 398.1184948, ymax: 612.3909341, temp: "2"},
    {year: 2025, ymin: 502, ymax: 591.3251527, temp: "1.5"},
    {year: 2030, ymin: 288, ymax: 398.1184948, temp: "1.5"},
];

export default {
	actual,
	future
};