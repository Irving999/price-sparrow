import { Filler } from "chart.js"
import { Line } from "react-chartjs-2"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js"

// Register components
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
)

export default function PriceChart({ priceData }) {
    if (!priceData || priceData.length <= 1) {
        return (
            <div className="mt-6 p-6 bg-gray-50 rounded-lg text-center">
                <p className="text-gray-500">
                    Not enough price history yet. A chart will appear after more price checks.
                </p>
            </div>
        )
    }
    // Chart data configuration
    const data = {
        labels: priceData.map(item => new Date(item.checkedAt).toLocaleDateString()),
        datasets: [
            {
                label: "Product Price",
                data: priceData.map(item => item.price),
                borderColor: "rgb(59, 130, 246)",
                backgroundColor: "rgba(59, 130, 246, 0.1)",
                tension: 0.1,
                pointRadius: 5,
                pointHoverRadius: 7,
                fill: true,
            }
        ]
    }

    // Chart options configurations
    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false,
                position: "top",
            },
            tooltip: {
                callbacks: {
                    label: function(context) {
                        return `$${context.parsed.y.toFixed(2)}`
                    }
                }
            }
        },
        scales: {
            y: {
                beginAtZero: false,
                ticks: {
                    callback: function(value) {
                        return "$" + value.toFixed(2)
                    }
                },
                grid: {
                    display: false
                },
            },
            x: {
                title: {
                    display: false,
                    text: "Date"
                },
                grid: {
                    display: false
                },
            }
        }
    }

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <h3 className="text-lg font-semibold mb-6">Market Price History</h3>
            <div className="bg-white rounded-lg shadow-lg p-6">
                <div style={{ height: '400px' }}>
                <Line data={data} options={options} />
                </div>
            </div>
        </div>
    )
}