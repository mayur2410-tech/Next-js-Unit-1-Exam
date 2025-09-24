import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:3000'; // adjust if your dev server runs elsewhere


test.describe('Companies API', () => {

    // ============================
//  1)Route Testing: GET /api/companies/count
// ============================
    test.describe('GET /api/companies/count', () => {

  test('returns total number of companies when no filters applied', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/api/companies/count`);
    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data).toHaveProperty('total');
    expect(typeof data.total).toBe('number');
    expect(data.total).toBeGreaterThan(0); // assuming DB has at least 1 company
  });

  test('returns smaller number when filtering by name', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/api/companies/count?name=Microsoft`);
    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data).toHaveProperty('total');
    expect(typeof data.total).toBe('number');
    expect(data.total).toBeLessThan(1000); // adjust according to your DB
  });

  test('returns 0 for non-existing company name', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/api/companies/count?name=NonExistentCompanyXYZ`);
    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data).toHaveProperty('total');
    expect(data.total).toBe(0);
  });

});


// ============================
// 2)Route Testing: GET /api/companies/top-paid
// Purpose: Returns companies sorted by base salary in descending order
// ============================
test.describe('GET /api/companies/top-paid', () => {

  // Test: Returns a maximum of 5 companies by default
  test('returns default 5 companies sorted by base salary descending', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/api/companies/top-paid`);
    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBeLessThanOrEqual(5);

    // Ensure descending order by salaryBand.base
    for (let i = 0; i < data.length - 1; i++) {
      const currentSalary = data[i].salaryBand?.base;
      const nextSalary = data[i + 1].salaryBand?.base;

      // Only compare if both values exist
      if (typeof currentSalary === 'number' && typeof nextSalary === 'number') {
        expect(currentSalary).toBeGreaterThanOrEqual(nextSalary);
      }
    }
  });

  // Test: Returns companies respecting the limit parameter
  test('respects the limit parameter', async ({ request }) => {
    const limit = 10;
    const response = await request.get(`${BASE_URL}/api/companies/top-paid?limit=${limit}`);
    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBeLessThanOrEqual(limit);

    // Ensure descending order by salaryBand.base
    for (let i = 0; i < data.length - 1; i++) {
      const currentSalary = data[i].salaryBand?.base;
      const nextSalary = data[i + 1].salaryBand?.base;
      if (typeof currentSalary === 'number' && typeof nextSalary === 'number') {
        expect(currentSalary).toBeGreaterThanOrEqual(nextSalary);
      }
    }
  });

  // Test: Returns maximum 50 companies even if limit is higher
  test('caps the limit at 50', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/api/companies/top-paid?limit=100`);
    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBeLessThanOrEqual(50);

    // Ensure descending order by salaryBand.base
    for (let i = 0; i < data.length - 1; i++) {
      const currentSalary = data[i].salaryBand?.base;
      const nextSalary = data[i + 1].salaryBand?.base;
      if (typeof currentSalary === 'number' && typeof nextSalary === 'number') {
        expect(currentSalary).toBeGreaterThanOrEqual(nextSalary);
      }
    }
  });

});



// ============================
// 3)Route Testing: GET /api/companies/by-skill/:skill
// Purpose: Returns companies that require a given skill in their hiringCriteria.skills array
// ============================
test.describe('GET /api/companies/by-skill/:skill', () => {

  // Test: Returns companies that include the skill in hiringCriteria.skills
  test('returns companies that require the specified skill', async ({ request }) => {
    const skill = 'DSA';
    const response = await request.get(`${BASE_URL}/api/companies/by-skill/${skill}`);
    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(Array.isArray(data)).toBe(true);

    // Ensure each company has the skill in hiringCriteria.skills (case-insensitive)
    data.forEach(company => {
      const skills = company.hiringCriteria?.skills || [];
      const hasSkill = skills.some(s => s.toLowerCase() === skill.toLowerCase());
      expect(hasSkill).toBe(true);
    });
  });

  // Test: Works case-insensitively (DSA vs dsa)
  test('works case-insensitively', async ({ request }) => {
    const skillUpper = 'DSA';
    const skillLower = 'dsa';

    const responseUpper = await request.get(`${BASE_URL}/api/companies/by-skill/${skillUpper}`);
    const responseLower = await request.get(`${BASE_URL}/api/companies/by-skill/${skillLower}`);
    expect(responseUpper.status()).toBe(200);
    expect(responseLower.status()).toBe(200);

    const dataUpper = await responseUpper.json();
    const dataLower = await responseLower.json();

    expect(dataUpper.length).toBe(dataLower.length);
  });

  // Test: Returns empty array for a non-existing skill
  test('returns empty array for non-existing skill', async ({ request }) => {
    const skill = 'NonExistentSkillXYZ';
    const response = await request.get(`${BASE_URL}/api/companies/by-skill/${skill}`);
    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBe(0);
  });

});

// ============================
// 4)Route Testing: GET /api/companies/by-location/:location
// Purpose: Returns companies located in the given city/location
// ============================
test.describe('GET /api/companies/by-location/:location', () => {

  // Test: Returns companies whose location matches the given parameter
  test('returns companies for the specified location', async ({ request }) => {
    const location = 'Hyderabad';
    const response = await request.get(`${BASE_URL}/api/companies/by-location/${location}`);
    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(Array.isArray(data)).toBe(true);

    // Ensure each company has the matching location (case-insensitive)
    data.forEach(company => {
      expect(company.location.toLowerCase()).toBe(location.toLowerCase());
    });
  });

  // Test: Works case-insensitively (Hyderabad vs hyderabad)
  test('works case-insensitively', async ({ request }) => {
    const locationUpper = 'Hyderabad';
    const locationLower = 'hyderabad';

    const responseUpper = await request.get(`${BASE_URL}/api/companies/by-location/${locationUpper}`);
    const responseLower = await request.get(`${BASE_URL}/api/companies/by-location/${locationLower}`);
    expect(responseUpper.status()).toBe(200);
    expect(responseLower.status()).toBe(200);

    const dataUpper = await responseUpper.json();
    const dataLower = await responseLower.json();

    expect(dataUpper.length).toBe(dataLower.length);
  });

  // Test: Returns empty array for a non-existing location
  test('returns empty array for non-existing location', async ({ request }) => {
    const location = 'NonExistentCityXYZ';
    const response = await request.get(`${BASE_URL}/api/companies/by-location/${location}`);
    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBe(0);
  });

});

// ============================
// 5)Route Testing: GET /api/companies/headcount-range
// Purpose: Returns companies whose headcount falls within the given range
// ============================
test.describe('GET /api/companies/headcount-range', () => {

  // Test: Returns companies with headcount >= min when only min is given
  test('returns companies with headcount >= min', async ({ request }) => {
    const min = 1000;
    const response = await request.get(`${BASE_URL}/api/companies/headcount-range?min=${min}`);
    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(Array.isArray(data)).toBe(true);

    data.forEach(company => {
      expect(company.headcount).toBeGreaterThanOrEqual(min);
    });
  });

  // Test: Returns companies with headcount between min and max
  test('returns companies within min and max headcount', async ({ request }) => {
    const min = 1000;
    const max = 5000;
    const response = await request.get(`${BASE_URL}/api/companies/headcount-range?min=${min}&max=${max}`);
    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(Array.isArray(data)).toBe(true);

    data.forEach(company => {
      expect(company.headcount).toBeGreaterThanOrEqual(min);
      expect(company.headcount).toBeLessThanOrEqual(max);
    });
  });

  // Test: Handles invalid input gracefully (min=abc)
  test('handles invalid min input gracefully', async ({ request }) => {
    const invalidMin = 'abc';
    const response = await request.get(`${BASE_URL}/api/companies/headcount-range?min=${invalidMin}`);
    
    // Assuming your route falls back to default min=0
    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(Array.isArray(data)).toBe(true);

    data.forEach(company => {
      expect(company.headcount).toBeGreaterThanOrEqual(0);
    });
  });

});

// ============================
// 6)Route Testing: GET /api/companies/benefit/:benefit
// Purpose: Returns companies that provide a given benefit (case-insensitive, substring match)
// ============================
test.describe('GET /api/companies/benefit/:benefit', () => {

  // Test: Returns companies that list the given benefit
  test('returns companies with the specified benefit', async ({ request }) => {
    const benefit = 'Insurance';
    const response = await request.get(`${BASE_URL}/api/companies/benefit/${benefit}`);
    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(Array.isArray(data)).toBe(true);

    // Ensure at least one company contains the benefit (substring, case-insensitive)
    data.forEach(company => {
      const matched = company.benefits.some(b => b.toLowerCase().includes(benefit.toLowerCase()));
      expect(matched).toBe(true);
    });
  });

  // Test: Works with partial match (e.g., "Insurance" matches "Health Insurance")
  test('matches partial benefit strings', async ({ request }) => {
    const partialBenefit = 'Insurance';
    const response = await request.get(`${BASE_URL}/api/companies/benefit/${partialBenefit}`);
    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(Array.isArray(data)).toBe(true);

    data.forEach(company => {
      const hasPartial = company.benefits.some(b => b.toLowerCase().includes(partialBenefit.toLowerCase()));
      expect(hasPartial).toBe(true);
    });
  });

  // Test: Works case-insensitively
  test('works case-insensitively', async ({ request }) => {
    const benefitUpper = 'Insurance';
    const benefitLower = 'insurance';

    const responseUpper = await request.get(`${BASE_URL}/api/companies/benefit/${benefitUpper}`);
    const responseLower = await request.get(`${BASE_URL}/api/companies/benefit/${benefitLower}`);
    expect(responseUpper.status()).toBe(200);
    expect(responseLower.status()).toBe(200);

    const dataUpper = await responseUpper.json();
    const dataLower = await responseLower.json();

    expect(dataUpper.length).toBe(dataLower.length);
  });

  // Test: Returns empty array if no company offers the benefit
  test('returns empty array for non-existing benefit', async ({ request }) => {
    const benefit = 'NonExistentBenefitXYZ';
    const response = await request.get(`${BASE_URL}/api/companies/benefit/${benefit}`);
    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBe(0);
  });

});





})


