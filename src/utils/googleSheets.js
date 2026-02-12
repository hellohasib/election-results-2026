
import Papa from 'papaparse';

const GOOGLE_SHEET_URL = 'https://docs.google.com/spreadsheets/d/1XK-qeXw-JgKPkttwmugLr27MeHYeWQck/export?format=csv';

export async function fetchElectionData() {
  try {
    const response = await fetch(GOOGLE_SHEET_URL, {
      next: { revalidate: 30 },
      cache: 'no-store' // Ensure fresh fetch for debugging
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch data: ${response.status} ${response.statusText}`);
    }

    const csvText = await response.text();

    return new Promise((resolve, reject) => {
      Papa.parse(csvText, {
        header: false, // Parse as arrays to handle duplicate headers safely
        skipEmptyLines: true,
        complete: (results) => {
          try {
            const rows = results.data;
            if (rows.length < 2) {
              resolve([]);
              return;
            }

            // Map based on visual column index (0-based) from inspection
            // A=0 (Division), C=2 (Constituency), 
            // F=5 (Candidate 1 Composite), G=6 (Votes 1)
            // J=9 (Candidate 2 Composite), K=10 (Votes 2)
            // N=13 (Candidate 3 Composite), O=14 (Votes 3)

            const data = [];
            let lastDivision = '';

            // Start from row 1 (skip header row 0)
            for (let i = 1; i < rows.length; i++) {
              const row = rows[i];

              // Safe access
              const getCol = (idx) => row[idx] ? row[idx].trim() : '';

              // Fill down Division
              let currentDivision = getCol(0);
              if (currentDivision) {
                lastDivision = currentDivision;
              } else {
                currentDivision = lastDivision;
              }

              // Skip if no Constituency (it's essential)
              const constituency = getCol(2);
              if (!constituency) continue;

              data.push({
                Division: currentDivision,
                Constituency: constituency,
                'Candidate 1': getCol(5),
                'Votes 1': cleanNumber(getCol(6)),
                'Candidate 2': getCol(9),
                'Votes 2': cleanNumber(getCol(10)),
                'Candidate 3': getCol(13),
                'Votes 3': cleanNumber(getCol(14)),
              });
            }

            resolve(data);
          } catch (err) {
            console.error('Error processing CSV rows:', err);
            reject(err);
          }
        },
        error: (error) => {
          console.error('PapaParse error:', error);
          reject(error);
        },
      });
    });
  } catch (error) {
    console.error('Error fetching election data:', error);
    // Return empty array so page doesn't crash, but log error
    return [];
  }
}

function cleanNumber(str) {
  if (!str) return 0;
  // Remove commas, spaces, non-numeric chars (except dot if decimal, but these are votes)
  const cleaned = str.replace(/[^0-9]/g, '');
  return parseInt(cleaned, 10) || 0;
}
