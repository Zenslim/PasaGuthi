export function resolveTodayNS() {
  const anchorDate = new Date("2024-11-02");
  const anchorNS = {
    year: 1146,
    month: "Kachhalā",
    day: 1,
    fortnight: "thwo",
    tithi: "Pratipada"
  };

  const nsMonths = [
    "Kachhalā", "Thinlā", "Pohelā", "Sillā", "Chillā", "Chaulā",
    "Bachhalā", "Tachhalā", "Dilā", "Gunalā", "Yelā", "Gāunlā"
  ];

  const tithis = [
    "Pratipada", "Dwitīyā", "Tritīyā", "Chaturthī", "Panchamī",
    "Shashthī", "Saptamī", "Ashtamī", "Navamī", "Dashamī",
    "Ekadashī", "Dwadashī", "Trayodashī", "Chaturdashī", "Purnimā",
    "Pratipada", "Dwitīyā", "Tritīyā", "Chaturthī", "Panchamī",
    "Shashthī", "Saptamī", "Ashtamī", "Navamī", "Dashamī",
    "Ekadashī", "Dwadashī", "Trayodashī", "Chaturdashī", "Amāwasyā"
  ];

  const today = new Date();
  const deltaDays = Math.floor((today - anchorDate) / (1000 * 60 * 60 * 24));

  let nsDay = anchorNS.day + deltaDays;
  let nsMonthIndex = nsMonths.indexOf(anchorNS.month);
  let nsYear = anchorNS.year;
  let tithiIndex = tithis.indexOf(anchorNS.tithi) + deltaDays;

  while (nsDay > 30) {
    nsDay -= 30;
    nsMonthIndex++;
    if (nsMonthIndex >= nsMonths.length) {
      nsMonthIndex = 0;
      nsYear++;
    }
  }

  tithiIndex = tithiIndex % tithis.length;
  const fortnight = tithiIndex < 15 ? "thwo" : "gā";

  return {
    today: today.toISOString().split("T")[0],
    nepal_sambat: {
      year: nsYear,
      month: nsMonths[nsMonthIndex],
      day: nsDay,
      fortnight: fortnight,
      tithi: tithis[tithiIndex]
    }
  };
}