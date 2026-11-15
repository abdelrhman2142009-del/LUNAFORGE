
function EngineeringAdvisor({
  selectedComponents,
  totals,
  solarPower,
  powerBalance,
  powerSufficient,
  storageAvailable,
  dataGenerationRate,
  downlinkSpeed,
  maxMass = 4,
  maxBudget = 10000,
}) {
  const hasSolar = selectedComponents.some(
    (component) => component.slot === "solar"
  );

  const hasBattery = selectedComponents.some(
    (component) => component.slot === "battery"
  );

  const hasPayload = selectedComponents.some(
    (component) => component.slot === "payload"
  );

  const hasComputer = selectedComponents.some(
    (component) => component.slot === "computer"
  );

  const hasCommunication = selectedComponents.some(
    (component) => component.slot === "communication"
  );

  const massPercentage = (totals.mass / maxMass) * 100;
  const budgetPercentage = (totals.cost / maxBudget) * 100;

  const downlinkMBPerMinute = downlinkSpeed * 7.5;

  const advice = [];

  // POWER ANALYSIS

  if (!hasSolar) {
    advice.push({
      type: "warning",
      title: "Solar power system missing",
      message:
        "Your spacecraft has no selected solar panels. Add a solar power system to provide electrical power.",
      recommendation: "Add solar panels",
    });
  } else if (!powerSufficient) {
    advice.push({
      type: "danger",
      title: "Insufficient power balance",
      message: `Your current power demand exceeds solar output by ${Math.abs(
        powerBalance
      ).toFixed(1)} W.`,
      recommendation:
        "Consider a solar system with higher output or components with lower power demand.",
    });
  } else if (totals.power > 0 && powerBalance / totals.power < 0.2) {
    advice.push({
      type: "warning",
      title: "Limited power margin",
      message:
        "Your available power is only slightly higher than the listed component demand.",
      recommendation:
        "Consider increasing your power margin before adding more power-consuming systems.",
    });
  } else {
    advice.push({
      type: "success",
      title: "Power balance looks good",
      message: `The current prototype power margin is ${powerBalance.toFixed(
        1
      )} W.`,
      recommendation: "Keep monitoring power demand as you modify the design.",
    });
  }

  // BATTERY ANALYSIS

  if (!hasBattery) {
    advice.push({
      type: "warning",
      title: "Battery not selected",
      message:
        "Your spacecraft has no battery selected to store electrical energy.",
      recommendation: "Add an energy storage battery.",
    });
  } else {
    advice.push({
      type: "success",
      title: "Energy storage selected",
      message: `Your selected battery has a listed capacity of ${totals.batteryCapacityWh.toFixed(
        1
      )} Wh.`,
      recommendation:
        "Battery endurance is not yet simulated in the current prototype.",
    });
  }

  // MASS ANALYSIS

  if (massPercentage > 100) {
    advice.push({
      type: "danger",
      title: "Mass limit exceeded",
      message: `Your spacecraft is ${(
        totals.mass - maxMass
      ).toFixed(2)} kg above the current ${maxMass} kg gameplay limit.`,
      recommendation: "Replace or remove components to reduce mass.",
    });
  } else if (massPercentage >= 85) {
    advice.push({
      type: "warning",
      title: "Mass limit approaching",
      message: `You are using ${massPercentage.toFixed(
        0
      )}% of the available mass.`,
      recommendation:
        "Check the mass of every additional component before selecting it.",
    });
  } else {
    advice.push({
      type: "success",
      title: "Mass within limits",
      message: `Your spacecraft currently uses ${totals.mass.toFixed(
        2
      )} kg out of ${maxMass} kg.`,
      recommendation: "You still have some mass available for your design.",
    });
  }

  // BUDGET ANALYSIS

  if (budgetPercentage > 100) {
    advice.push({
      type: "danger",
      title: "Budget exceeded",
      message: `Your design exceeds the budget by ${(
        totals.cost - maxBudget
      ).toLocaleString()} CR.`,
      recommendation: "Consider lower-cost alternative components.",
    });
  } else if (budgetPercentage >= 85) {
    advice.push({
      type: "warning",
      title: "Budget nearly exhausted",
      message: `You have used ${budgetPercentage.toFixed(
        0
      )}% of the available budget.`,
      recommendation:
        "Compare component performance against cost before spending more.",
    });
  } else {
    advice.push({
      type: "success",
      title: "Budget under control",
      message: `You have ${(
        maxBudget - totals.cost
      ).toLocaleString()} CR remaining.`,
      recommendation: "Keep enough credits available for essential systems.",
    });
  }

  // DATA SYSTEM ANALYSIS

  if (!hasPayload) {
    advice.push({
      type: "warning",
      title: "Observation payload missing",
      message:
        "Your spacecraft cannot generate Earth observation data without a payload.",
      recommendation: "Select an Earth observation camera.",
    });
  } else if (!hasComputer || storageAvailable <= 0) {
    advice.push({
      type: "warning",
      title: "Data storage system incomplete",
      message:
        "Your design needs an onboard computer with available storage.",
      recommendation: "Add the onboard computer.",
    });
  } else if (!hasCommunication || downlinkSpeed <= 0) {
    advice.push({
      type: "warning",
      title: "Communication system missing",
      message:
        "Your spacecraft needs a communication system to transmit collected data.",
      recommendation: "Add a communication system.",
    });
  } else if (dataGenerationRate > downlinkMBPerMinute) {
    advice.push({
      type: "warning",
      title: "Data generation exceeds downlink",
      message: `Your camera generates ${dataGenerationRate.toFixed(
        1
      )} MB/min, while the listed downlink capacity is ${downlinkMBPerMinute.toFixed(
        1
      )} MB/min.`,
      recommendation:
        "Consider a faster communication system or a lower data generation rate.",
    });
  } else {
    advice.push({
      type: "success",
      title: "Data system looks balanced",
      message:
        "Your selected storage and communication systems are available, and the listed downlink rate can keep up with the current data generation rate.",
      recommendation:
        "Continue checking storage usage during mission simulation.",
    });
  }

  const statusStyles = {
    success: {
      color: "#45d6a0",
      background: "rgba(69, 214, 160, 0.08)",
      border: "rgba(69, 214, 160, 0.25)",
      symbol: "✓",
    },
    warning: {
      color: "#f3bd55",
      background: "rgba(243, 189, 85, 0.08)",
      border: "rgba(243, 189, 85, 0.25)",
      symbol: "!",
    },
    danger: {
      color: "#ff626f",
      background: "rgba(255, 98, 111, 0.08)",
      border: "rgba(255, 98, 111, 0.25)",
      symbol: "×",
    },
  };

  const warningCount = advice.filter(
    (item) => item.type !== "success"
  ).length;

  return (
    <section
      style={{
        marginBottom: "24px",
        padding: "22px",
        borderRadius: "12px",
        border: "1px solid rgba(91, 178, 224, 0.25)",
        background: "linear-gradient(145deg, #10263b, #0b1c2e)",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "12px",
          flexWrap: "wrap",
          marginBottom: "8px",
        }}
      >
        <div>
          <span
            style={{
              color: "#65c9f1",
              fontSize: "10px",
              letterSpacing: "2px",
              fontWeight: 700,
            }}
          >
            LUNAFORGE / ENGINEERING INTELLIGENCE
          </span>

          <h2
            style={{
              color: "#f1f6fc",
              fontSize: "21px",
              margin: "7px 0",
            }}
          >
            Engineering Advisor
          </h2>
        </div>

        <span
          style={{
            color: warningCount > 0 ? "#f3bd55" : "#45d6a0",
            fontSize: "11px",
            fontWeight: 700,
            letterSpacing: "1px",
          }}
        >
          {warningCount > 0
            ? `${warningCount} ITEMS TO REVIEW`
            : "DESIGN LOOKS GOOD"}
        </span>
      </div>

      <p
        style={{
          color: "#9db2c7",
          fontSize: "12px",
          lineHeight: 1.7,
          marginBottom: "20px",
        }}
      >
        Engineering feedback based on your current spacecraft
        configuration. Recommendations are advisory and do not
        automatically change your design.
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "12px",
        }}
      >
        {advice.map((item, index) => {
          const style = statusStyles[item.type];

          return (
            <article
              key={index}
              style={{
                padding: "15px",
                borderRadius: "9px",
                border: `1px solid ${style.border}`,
                background: style.background,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "9px",
                  marginBottom: "10px",
                }}
              >
                <span
                  style={{
                    width: "23px",
                    height: "23px",
                    display: "grid",
                    placeItems: "center",
                    borderRadius: "50%",
                    background: style.background,
                    border: `1px solid ${style.border}`,
                    color: style.color,
                    fontWeight: 800,
                  }}
                >
                  {style.symbol}
                </span>

                <strong
                  style={{
                    color: style.color,
                    fontSize: "12px",
                  }}
                >
                  {item.title}
                </strong>
              </div>

              <p
                style={{
                  color: "#d6e2ee",
                  fontSize: "12px",
                  lineHeight: 1.7,
                  margin: "0 0 12px",
                }}
              >
                {item.message}
              </p>

              <div
                style={{
                  paddingTop: "10px",
                  borderTop: "1px solid rgba(255,255,255,0.08)",
                }}
              >
                <span
                  style={{
                    color: "#65c9f1",
                    fontSize: "9px",
                    letterSpacing: "1px",
                    fontWeight: 700,
                  }}
                >
                  ADVISOR RECOMMENDATION
                </span>

                <p
                  style={{
                    color: "#a9c1d5",
                    fontSize: "11px",
                    lineHeight: 1.6,
                    margin: "5px 0 0",
                  }}
                >
                  {item.recommendation}
                </p>
              </div>
            </article>
          );
        })}
      </div>

      <p
        style={{
          color: "#718ba3",
          fontSize: "10px",
          lineHeight: 1.6,
          margin: "16px 0 0",
        }}
      >
        ADVISORY MODEL: Feedback uses simplified prototype
        gameplay assumptions. It is not a real spacecraft
        engineering certification or flight-readiness assessment.
      </p>
    </section>
  );
}

export default EngineeringAdvisor;
