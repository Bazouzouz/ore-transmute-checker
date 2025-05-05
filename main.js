const TIER_LEVELS = ["T4", "T5", "T6", "T7", "T8"];
const ENCHANTMENTS = ["0", "1", "2", "3", "4"];

const transmuteCosts = JSON.parse(localStorage.getItem("transmuteCosts") || "{}");

function getCost(tier, recipe) {
  return transmuteCosts?.[recipe]?.[tier] ?? 0;
}

function saveTransmuteCosts() {
  document.querySelectorAll(".cost-input").forEach(input => {
    const [tier, recipe] = input.dataset.key.split("_");
    if (!transmuteCosts[recipe]) transmuteCosts[recipe] = {};
    transmuteCosts[recipe][tier] = parseFloat(input.value);
  });
  localStorage.setItem("transmuteCosts", JSON.stringify(transmuteCosts));
  alert("Coûts sauvegardés !");
}

function showPage(page) {
  document.getElementById("mainPage").classList.toggle("hidden", page !== "main");
  document.getElementById("infoPage").classList.toggle("hidden", page !== "info");
}

function buildCostEditor() {
  const container = document.getElementById("costEditor");
  container.innerHTML = "";
  ["R1", "R2"].forEach(recipe => {
    TIER_LEVELS.forEach(tier => {
      const key = `${tier}_${recipe}`;
      const val = getCost(tier, recipe);
      container.innerHTML += `
        <div>
          <label>${tier} - ${recipe} :
            <input class="cost-input" data-key="${tier}_${recipe}" type="number" value="${val}">
          </label>
        </div>
      `;
    });
  });
}

async function refreshPrices() {
  const city = document.getElementById("citySelect").value;
  const itemIds = [];

  TIER_LEVELS.forEach(tier => {
    ENCHANTMENTS.forEach(enchant => {
      if (enchant === "0") {
        itemIds.push(`${tier}_ORE`);
      } else {
        itemIds.push(`${tier}_ORE_LEVEL${enchant}@${enchant}`);
      }
    });
  });

  const data = await fetchPrices(itemIds, city);
  const priceMap = {};
  data.forEach(d => {
    priceMap[d.item_id] = d.sell_price_min > 0 ? d.sell_price_min : d.buy_price_max;
  });

  buildTable(priceMap);
}

function buildTable(priceMap) {
  const container = document.getElementById("oreTableContainer");
  container.innerHTML = "";

  let html = "<table><thead><tr><th>De</th><th>Vers</th><th>Coût</th><th>Prix Achat</th><th>Prix Revente</th><th>Bénéfice</th></tr></thead><tbody>";

  TIER_LEVELS.forEach((tier, i) => {
    if (i >= TIER_LEVELS.length - 1) return;
    const nextTier = TIER_LEVELS[i + 1];

    ENCHANTMENTS.forEach(enchant => {
      const base = enchant === "0" ? `${tier}_ORE` : `${tier}_ORE_LEVEL${enchant}@${enchant}`;
      const upgraded = `${nextTier}_ORE_LEVEL${enchant}@${enchant}`;

      const cost = getCost(tier, "R1");
      const buy = priceMap[base] || 0;
      const sell = priceMap[upgraded] || 0;
      const profit = sell - buy - cost;

      html += `<tr>
        <td>${tier}.${enchant}</td>
        <td>${nextTier}.${enchant}</td>
        <td>${cost}</td>
        <td>${buy}</td>
        <td>${sell}</td>
        <td style="color:${profit >= 0 ? 'green' : 'red'}">${profit}</td>
      </tr>`;
    });
  });

  html += "</tbody></table>";
  container.innerHTML = html;
}

// Init
document.addEventListener("DOMContentLoaded", () => {
  showPage("main");
  buildCostEditor();
  refreshPrices();
});
// JS principal pour logique de transmutation
