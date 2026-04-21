export type CountryDisplayInput = {
  countryCode?: string;
  countryName: string;
  sourceCountryName?: string;
};

const COUNTRY_NAME_TO_CODE: Record<string, string> = {
  afghanistan: "AF",
  albania: "AL",
  algeria: "DZ",
  andorra: "AD",
  angola: "AO",
  argentina: "AR",
  armenia: "AM",
  australia: "AU",
  austria: "AT",
  azerbaijan: "AZ",
  bahamas: "BS",
  bahrain: "BH",
  bangladesh: "BD",
  belarus: "BY",
  belgium: "BE",
  belize: "BZ",
  benin: "BJ",
  bhutan: "BT",
  bolivia: "BO",
  "bosnia and herzegovina": "BA",
  botswana: "BW",
  brazil: "BR",
  brunei: "BN",
  bulgaria: "BG",
  "burkina faso": "BF",
  burundi: "BI",
  cambodia: "KH",
  cameroon: "CM",
  canada: "CA",
  chad: "TD",
  chile: "CL",
  china: "CN",
  colombia: "CO",
  "costa rica": "CR",
  croatia: "HR",
  cuba: "CU",
  cyprus: "CY",
  czechia: "CZ",
  "czech republic": "CZ",
  denmark: "DK",
  djibouti: "DJ",
  "dominican republic": "DO",
  ecuador: "EC",
  egypt: "EG",
  "el salvador": "SV",
  eritrea: "ER",
  estonia: "EE",
  ethiopia: "ET",
  fiji: "FJ",
  finland: "FI",
  france: "FR",
  georgia: "GE",
  germany: "DE",
  ghana: "GH",
  greece: "GR",
  guatemala: "GT",
  guinea: "GN",
  guyana: "GY",
  haiti: "HT",
  honduras: "HN",
  hungary: "HU",
  iceland: "IS",
  india: "IN",
  indonesia: "ID",
  iran: "IR",
  iraq: "IQ",
  ireland: "IE",
  israel: "IL",
  italy: "IT",
  jamaica: "JM",
  japan: "JP",
  jordan: "JO",
  kazakhstan: "KZ",
  kenya: "KE",
  kosovo: "XK",
  kuwait: "KW",
  kyrgyzstan: "KG",
  laos: "LA",
  latvia: "LV",
  lebanon: "LB",
  lesotho: "LS",
  liberia: "LR",
  libya: "LY",
  lithuania: "LT",
  luxembourg: "LU",
  madagascar: "MG",
  malawi: "MW",
  malaysia: "MY",
  maldives: "MV",
  mali: "ML",
  malta: "MT",
  mexico: "MX",
  moldova: "MD",
  mongolia: "MN",
  montenegro: "ME",
  morocco: "MA",
  mozambique: "MZ",
  myanmar: "MM",
  namibia: "NA",
  nepal: "NP",
  netherlands: "NL",
  "new zealand": "NZ",
  nicaragua: "NI",
  niger: "NE",
  nigeria: "NG",
  norway: "NO",
  oman: "OM",
  pakistan: "PK",
  panama: "PA",
  paraguay: "PY",
  peru: "PE",
  philippines: "PH",
  poland: "PL",
  portugal: "PT",
  qatar: "QA",
  romania: "RO",
  russia: "RU",
  rwanda: "RW",
  "saudi arabia": "SA",
  senegal: "SN",
  serbia: "RS",
  singapore: "SG",
  slovakia: "SK",
  slovenia: "SI",
  somalia: "SO",
  "south africa": "ZA",
  "south korea": "KR",
  spain: "ES",
  "sri lanka": "LK",
  sudan: "SD",
  sweden: "SE",
  switzerland: "CH",
  syria: "SY",
  taiwan: "TW",
  tajikistan: "TJ",
  tanzania: "TZ",
  thailand: "TH",
  tunisia: "TN",
  turkey: "TR",
  turkmenistan: "TM",
  uganda: "UG",
  ukraine: "UA",
  "united arab emirates": "AE",
  "united kingdom": "GB",
  "united states": "US",
  "united states of america": "US",
  uruguay: "UY",
  uzbekistan: "UZ",
  venezuela: "VE",
  vietnam: "VN",
  yemen: "YE",
  zambia: "ZM",
  zimbabwe: "ZW",
};

function normalizeCountryName(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/&/g, " and ")
    .replace(/[^a-zA-Z0-9]+/g, " ")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

export function resolveCountryCodeFromName(
  countryName: string,
): string | undefined {
  return COUNTRY_NAME_TO_CODE[normalizeCountryName(countryName)];
}

export function getCountryDisplayName(
  locale: string,
  country: CountryDisplayInput,
): string {
  if (!country.countryCode) {
    return country.sourceCountryName ?? country.countryName;
  }

  try {
    const displayNames = new Intl.DisplayNames([locale, "en"], {
      type: "region",
    });
    return (
      displayNames.of(country.countryCode) ??
      country.sourceCountryName ??
      country.countryName
    );
  } catch {
    return country.sourceCountryName ?? country.countryName;
  }
}
