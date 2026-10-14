/**
 * Indian Bank & UPI SMS Parser
 * Extracts amount, merchant, and suggests category with breathing affinity.
 */

export interface ParsedSMSResult {
  amount: number;
  merchant: string;
  category: string;
  type: "income" | "expense";
  date?: string;
}

const CATEGORY_MAP: [string, string][] = [
  ["Swiggy|Zomato|McDonald|KFC|Domino|Pizza|Restaurant|Hotel|Cafe|Food|Mess|Canteen|Dhaba|Biryani|Diner|Starbucks|Burger King|Haldiram|Chai", "Dining & Food"],
  ["Uber|Ola|Auto|Bus|Train|Metro|Rapido|InDrive|Fuel|Petrol|Diesel|Parking|IRCTC|RedBus|Shell|IndianOil|HPCL|BPCL", "Transportation"],
  ["BigBasket|Grofers|DMart|Blinkit|Zepto|Grocery|Vegetables|Fruits|Kirana|Nature", "Groceries"],
  ["Amazon|Flipkart|Myntra|Meesho|Ajio|Nykaa|Snapdeal|ShopClues|Shop|Store|Mall|Market|Zara|H&M|Decathlon", "Shopping"],
  ["Netflix|Hotstar|Spotify|Prime|YouTube|Game|Steam|Paytm Games|Disney|Jiocinema|SonyLiv|BookMyShow|PVR|INOX", "Entertainment"],
  ["Rent|PG|Hostel|Room|Accommodation|Society|Apartment|Flat", "Rent & Housing"],
  ["Airtel|Jio|Vi|BSNL|Mobile|Recharge|DTH|Broadband|Internet|Wifi|Fiber", "Utilities & Bills"],
  ["Electricity|Water|Gas|LPG|Utility|BESCOM|MSEDCL|TNEB|Maintenance|Society fee|Adani", "Utilities & Bills"],
  ["Hospital|Doctor|Pharmacy|Medical|Clinic|Apollo|Medplus|1mg|Health|Dental|Optician|Gym|Fitness|Cult", "Health & Fitness"],
  ["SIP|Mutual Fund|Zerodha|Groww|Upstox|Coin|Index|Nifty|Sensex|Stock|Investment", "Investments & SIP"],
  ["salary|Salary|stipend|Stipend|payment received|credited by|UPI credit|Received from|Infosys|TCS|Wipro|Accenture", "Salary & Income"],
  ["Book|College|Exam|Tuition|Coaching|Course|Udemy|Certificate|School|Institute|Library", "Education"],
  ["Gift|Birthday|Occasion|Wedding|Festival", "Gifts"],
  ["Hotel|Flight|Travel|Trip|Booking|MakeMyTrip|Goibibo|Cleartrip|OYO|AirIndia|IndiGo", "Travel"],
];

export function guessCategory(text: string): string {
  for (const [pattern, cat] of CATEGORY_MAP) {
    if (new RegExp(pattern, "i").test(text)) return cat;
  }
  return "Miscellaneous";
}

function parseAmount(str: string): number | null {
  if (!str) return null;
  const n = parseFloat(str.replace(/,/g, "").trim());
  return isNaN(n) ? null : n;
}

function cleanMerchant(str: string): string {
  if (!str) return "";
  return str
    .replace(/\b(?:via|using|on|ref|txn|avl|bal|upi|a\/c|acc|ending|dated)\b.*$/i, "")
    .replace(/^[\s:.\-,/]+|[\s:.\-,/]+$/g, "")
    .trim()
    .slice(0, 50);
}

export function parseSMS(text: string): ParsedSMSResult | null {
  if (!text || text.trim().length < 8) return null;

  const raw = text.replace(/\n/g, " ").trim();

  // 2. Extract Transaction Amount & Scope
  let amount: number | null = null;
  const parts = raw.split(/(?:avl\s*bal|available\s*bal|avl\s*lmt|available\s*limit)/i);
  const txText = parts[0];

  // 1. Determine Credit vs Debit (Prioritize text before balance statements)
  const isCredit = /\b(?:credited|received|credit|deposited|deposit|salary|stipend|cashback|refund|rewarded)\b/i.test(txText) ||
    (/\b(?:credited|received|salary|stipend)\b/i.test(raw) && !/\b(?:debited|deducted|withdrawn)\b/i.test(txText));
  const isDebit = /\b(?:debited|deducted|paid|spent|used|charged|withdrawn|transfer to)\b/i.test(txText);
  const type: "income" | "expense" = isCredit && !isDebit ? "income" : "expense";

  const amtPatterns = [
    /(?:paid|spent|debited\s*(?:by|for|with)?|charged|withdrawn)\s*(?:Rs\.?|INR|₹)\s*([\d,]+(?:\.\d{1,2})?)/i,
    /(?:Rs\.?|INR|₹)\s*([\d,]+(?:\.\d{1,2})?)\s+(?:debited|spent|paid|charged|transferred|deducted)/i,
    /(?:salary\s+of\s+)?(?:Rs\.?|INR|₹)\s*([\d,]+(?:\.\d{1,2})?)\s+(?:credited|deposited|received)/i,
    /(?:credited\s*(?:with|by|for)?|received)\s*(?:Rs\.?|INR|₹)\s*([\d,]+(?:\.\d{1,2})?)/i,
    /(?:Rs\.?|INR|₹)\s*([\d,]+(?:\.\d{1,2})?)/i,
  ];

  for (const rx of amtPatterns) {
    const m = rx.exec(txText);
    if (m && m[1]) {
      const parsed = parseAmount(m[1]);
      if (parsed && parsed > 0) {
        amount = parsed;
        break;
      }
    }
  }

  if (!amount) {
    const fallbackM = /(?:Rs\.?|INR|₹)\s*([\d,]+(?:\.\d{1,2})?)/i.exec(raw);
    if (fallbackM) amount = parseAmount(fallbackM[1]);
  }

  if (!amount) return null;

  // 3. Extract Merchant
  let merchant = "";
  const merchantPatterns = [
    /(?:paid|transferred|sent)\s+(?:(?:Rs\.?|INR|₹)\s*[\d,.]+\s+)?to\s+([A-Za-z0-9\s&.\-@]+?)(?:\s+(?:via|using|on|ref|txn|upi|avl)|\.|$)/i,
    /(?:at|to|towards|for|Info:)\s+([A-Za-z0-9\s&.\-@]+?)(?:\s+(?:on|via|using|ref|txn|upi|avl|bal)|\.|$)/i,
    /(?:credited|received)\s+(?:.+?(?:by|from)\s+)?([A-Za-z0-9\s&.\-@]+?)(?:\s+(?:on|via|using|ref|txn|avl|bal)|\.|$)/i,
    /(?:transfer\s+to)\s+([A-Za-z0-9\s&.\-@]+?)(?:\s+(?:via|on|ref|upi)|\.|$)/i,
    /(?:from)\s+([A-Za-z0-9\s&.\-@]+?)(?:\s+(?:via|on|ref|upi|avl)|\.|$)/i,
  ];

  for (const rx of merchantPatterns) {
    const m = rx.exec(txText);
    if (m && m[1]) {
      const candidate = cleanMerchant(m[1]);
      if (candidate && !/^(your|a\/c|account|card|bank|ending|dated|upi)$/i.test(candidate)) {
        merchant = candidate;
        break;
      }
    }
  }

  if (!merchant) {
    const upiMatch = /([A-Za-z0-9._\-]+@[a-zA-Z]+)/.exec(raw);
    if (upiMatch) merchant = upiMatch[1];
  }

  const category = guessCategory(merchant + " " + raw);

  // 4. Optionally extract date (e.g. 11-10-2026, 11/10/26, 11-Oct-26)
  let date: string | undefined;
  const dateMatch = /\b(\d{1,2})[-/](\d{1,2}|[A-Za-z]{3})[-/](\d{2,4})\b/.exec(raw);
  if (dateMatch) {
    try {
      const day = dateMatch[1].padStart(2, "0");
      let month = dateMatch[2];
      const monthNames: Record<string, string> = {
        jan: "01", feb: "02", mar: "03", apr: "04", may: "05", jun: "06",
        jul: "07", aug: "08", sep: "09", oct: "10", nov: "11", dec: "12",
      };
      if (monthNames[month.toLowerCase()]) {
        month = monthNames[month.toLowerCase()];
      } else {
        month = month.padStart(2, "0");
      }
      let year = dateMatch[3];
      if (year.length === 2) year = "20" + year;
      date = `${year}-${month}-${day}`;
    } catch (_e) {}
  }

  return {
    amount,
    merchant: merchant || "",
    category,
    type,
    date,
  };
}
