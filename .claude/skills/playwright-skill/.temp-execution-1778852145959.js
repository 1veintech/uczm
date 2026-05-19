// Test region validation for complaints
const { chromium } = require('playwright');

const BASE_URL = 'http://localhost:3000';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });

  try {
    // Test 1: Check complaint API region validation via direct API call
    console.log('\n=== Test 1: Complaint API region validation ===');

    // First check the agent's region bounds
    const regionRes = await page.goto(`${BASE_URL}/api/agent/region`, { waitUntil: 'networkidle' });
    const regionData = await regionRes.json();
    console.log('Agent region data:', JSON.stringify(regionData, null, 2));

    // Check if agent has region bounds set
    const agentWithBounds = regionData.agents?.find(a => {
      try {
        const bounds = JSON.parse(a.regionBounds || '[]');
        return bounds.length >= 3;
      } catch { return false; }
    });

    if (agentWithBounds) {
      console.log(`Found agent "${agentWithBounds.name}" with region bounds (${JSON.parse(agentWithBounds.regionBounds).length} points)`);

      // Test complaint submission - the API should validate region
      const testComplaint = async (lat, lng, label) => {
        const res = await page.evaluate(async (params) => {
          const r = await fetch('/api/complaints', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              problemType: 'MISSING',
              description: '测试投诉 - 区域校验',
              customerLat: params.lat,
              customerLng: params.lng,
            }),
          });
          return { status: r.status, data: await r.json() };
        }, { lat, lng });

        console.log(`${label}: status=${res.status}, result=${JSON.stringify(res.data)}`);
        return res;
      };

      // Test with point INSIDE Beijing Chaoyang (approx center)
      const insideResult = await testComplaint(39.92, 116.44, 'Inside region (Beijing Chaoyang)');

      // Test with point FAR OUTSIDE (e.g., Guangzhou)
      const outsideResult = await testComplaint(23.13, 113.26, 'Outside region (Guangzhou)');

      // Verify results
      if (insideResult.status === 200) {
        console.log('✅ Inside region: complaint accepted');
      } else {
        console.log('❌ Inside region: complaint rejected (unexpected)');
      }

      if (outsideResult.status === 400 && outsideResult.data.error?.includes('服务范围')) {
        console.log('✅ Outside region: complaint rejected with correct error message');
      } else {
        console.log('❌ Outside region: complaint not rejected properly');
      }
    } else {
      console.log('No agent with region bounds found, skipping region check test');

      // Test complaint without region bounds
      const res = await page.evaluate(async () => {
        const r = await fetch('/api/complaints', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            problemType: 'MISSING',
            description: '测试投诉',
          }),
        });
        return { status: r.status, data: await r.json() };
      });
      console.log(`Complaint result: status=${res.status}, data=${JSON.stringify(res.data)}`);
      if (res.status === 200) {
        console.log('✅ Complaint submitted successfully (no region bounds set)');
      }
    }

    // Test 2: Check agent stations show region info
    console.log('\n=== Test 2: Agent stations show region ===');
    await page.goto(`${BASE_URL}/login`);
    await page.waitForTimeout(500);
    await page.locator('text=管理后台').click();
    await page.waitForTimeout(300);
    await page.fill('input[placeholder*="账号"]', 'agent@ddcm.com');
    await page.fill('input[type="password"]', 'agent123');
    await page.locator('button[type="submit"]:has-text("登")').first().click();
    await page.waitForTimeout(2000);
    await page.goto(`${BASE_URL}/agent/stations`);
    await page.waitForTimeout(1000);

    const regionBadge = await page.locator('.bg-blue-500\\/10').first().isVisible().catch(() => false);
    console.log(`Region badge visible: ${regionBadge ? '✅' : '❌'}`);

    // Test 3: Check admin stations show region
    console.log('\n=== Test 3: Admin stations show region ===');
    await page.evaluate(() => { localStorage.clear(); });
    await page.goto(`${BASE_URL}/login`);
    await page.waitForTimeout(500);
    await page.locator('text=管理后台').click();
    await page.waitForTimeout(300);
    await page.fill('input[placeholder*="账号"]', 'admin@ddcm.com');
    await page.fill('input[type="password"]', 'admin123');
    await page.locator('button[type="submit"]:has-text("登")').first().click();
    await page.waitForTimeout(2000);
    await page.goto(`${BASE_URL}/admin/stations`);
    await page.waitForTimeout(1000);

    const adminRegionCol = await page.evaluate(() => {
      const ths = document.querySelectorAll('th');
      return Array.from(ths).some(th => th.textContent?.includes('区域'));
    });
    console.log(`Admin region column: ${adminRegionCol ? '✅' : '❌'}`);

    console.log('\n🏁 Region validation tests complete');

  } catch (error) {
    console.error('Test error:', error.message);
  } finally {
    await browser.close();
  }
})();
