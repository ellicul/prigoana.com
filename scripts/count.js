const apiUrl = "https://121124.prigoana.com/prigoana.com/";

async function fetchVisitorCount() {
  try {
    const response = await fetch(apiUrl);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

    const data = await response.json();
    const count = formatNumberWithCommas(data.count);

    document.getElementById("visitor-count").textContent = `You're visitor no. ${count}`;
  } catch (error) {
    document.getElementById("visitor-count").textContent = "";
    console.error("Error fetching visitor count:", error);
  }
}

function formatNumberWithCommas(number) {
  return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

fetchVisitorCount();