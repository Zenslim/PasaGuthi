// utils/checkTharMatch.js

export function checkTharMatch(oauthDisplayName, claimedThar, knownTharList = []) {
  if (!claimedThar || !oauthDisplayName) return { match: false, reason: 'Missing data' };

  const oauthSurname = oauthDisplayName.split(' ').slice(-1)[0].toLowerCase();
  const claimedTharLower = claimedThar.toLowerCase();
  const isKnownThar = knownTharList.map(t => t.toLowerCase()).includes(oauthSurname);

  if (oauthSurname === claimedTharLower) {
    return { match: true, reason: 'Exact match' };
  } else if (!isKnownThar) {
    return {
      match: false,
      reason: `OAuth surname '${oauthSurname}' is not in the verified Newar Thar list.`
    };
  } else {
    return {
      match: false,
      reason: `You entered '${claimedThar}', but your login name ends with '${oauthSurname}'.`
    };
  }
}
