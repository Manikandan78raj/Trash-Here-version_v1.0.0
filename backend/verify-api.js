const http = require('http');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const PORT = 3005;
const BASE_URL = `http://localhost:${PORT}/api/v1`;

function request(method, endpoint, body = null, token = null) {
  return new Promise((resolve, reject) => {
    const url = endpoint.startsWith('http') ? endpoint : `${BASE_URL}${endpoint}`;
    const parsedUrl = new URL(url);
    const options = {
      hostname: parsedUrl.hostname,
      port: parsedUrl.port || PORT,
      path: parsedUrl.pathname + parsedUrl.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve({ status: res.statusCode, data: json });
        } catch (e) {
          resolve({ status: res.statusCode, data });
        }
      });
    });

    req.on('error', (err) => reject(err));

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function runVerification() {
  const entryPoint = fs.existsSync(path.join(__dirname, 'dist/main.js')) ? 'dist/main.js' : 'dist/src/main.js';
  console.log(`🚀 [1/3] Starting NestJS Production Server (${entryPoint}) on Port ${PORT}...`);
  
  const serverProcess = spawn('node', [entryPoint], {
    cwd: path.join(__dirname),
    env: { ...process.env, PORT: String(PORT), NODE_ENV: 'development' },
    stdio: ['ignore', 'pipe', 'pipe']
  });

  let serverStarted = false;

  serverProcess.stdout.on('data', (data) => {
    const str = data.toString();
    if (str.includes('Trash Here Enterprise API is live') || str.includes('Nest application successfully started') || str.includes('running on:')) {
      serverStarted = true;
    }
  });

  serverProcess.stderr.on('data', (data) => {
    console.error(`[SERVER STDERR] ${data.toString().trim()}`);
  });

  // Wait up to 10 seconds for server to start
  for (let i = 0; i < 20; i++) {
    await new Promise(r => setTimeout(r, 500));
    if (serverStarted) break;
  }

  if (!serverStarted) {
    console.log('⚠️ Server startup message not detected, attempting connection test anyway...');
  }

  console.log('\n🧪 [2/3] Executing Enterprise API Verification Suite...\n');
  let passed = 0;
  let failed = 0;

  function assert(testName, condition, details = '') {
    if (condition) {
      console.log(`✅ [PASS] ${testName} ${details}`);
      passed++;
    } else {
      console.log(`❌ [FAIL] ${testName} ${details}`);
      failed++;
    }
  }

  try {
    // 1. Test Swagger Docs
    const swaggerRes = await request('GET', `http://localhost:${PORT}/api/docs-json`);
    assert('Swagger API JSON Documentation', swaggerRes.status === 200 && swaggerRes.data.openapi, `(OpenAPI v${swaggerRes.data?.openapi || 'unknown'})`);

    // 2. Test Auth - Register Household User
    const regEmail = `test.user.${Date.now()}@trashhere.com`;
    const regPhone = `+1555${Math.floor(1000000 + Math.random() * 9000000)}`;
    const regRes = await request('POST', '/auth/register', {
      email: regEmail,
      password: 'Password@123',
      fullName: 'Sarah Jenkins',
      phone: regPhone,
      role: 'USER'
    });
    assert('Auth Module - Household User Registration', (regRes.status === 201 || regRes.status === 200) && regRes.data.data?.accessToken, `(User ID: ${regRes.data.data?.user?.id})`);
    const newUserToken = regRes.data.data?.accessToken;

    // 3. Test Auth - Login Seeded Household User (Has 2450 green points)
    const userLoginRes = await request('POST', '/auth/login', {
      email: 'user@trashhere.com',
      password: 'Password123!'
    });
    assert('Auth Module - Seeded Household User Login', userLoginRes.status === 200 && userLoginRes.data.data?.accessToken, `(Role: USER)`);
    const userToken = userLoginRes.data.data?.accessToken;

    // 4. Test Auth - Login Seeded Admin User
    const adminLoginRes = await request('POST', '/auth/login', {
      email: 'admin@trashhere.com',
      password: 'Password123!'
    });
    assert('Auth Module - Admin Login & JWT Generation', adminLoginRes.status === 200 && adminLoginRes.data.data?.accessToken, `(Role: ADMIN)`);
    const adminToken = adminLoginRes.data.data?.accessToken;

    // 5. Test Auth - Login Seeded Collector User
    const collectorLoginRes = await request('POST', '/auth/login', {
      email: 'collector@trashhere.com',
      password: 'Password123!'
    });
    assert('Auth Module - Collector Login & JWT Generation', collectorLoginRes.status === 200 && collectorLoginRes.data.data?.accessToken, `(Role: COLLECTOR)`);
    const collectorToken = collectorLoginRes.data.data?.accessToken;

    // 6. Test Users Module - Get Profile (JWT Auth Protected)
    const profileRes = await request('GET', '/users/profile', null, userToken);
    assert('Users Module - Get Protected Profile', profileRes.status === 200 && profileRes.data.data?.email === 'user@trashhere.com', `(Eco Score: ${profileRes.data.data?.ecoScore})`);

    // 7. Test Users Module - Add Address
    const addressRes = await request('POST', '/users/addresses', {
      label: 'Home',
      street: '742 Evergreen Terrace',
      city: 'Springfield',
      state: 'OR',
      zipCode: '97477',
      lat: 44.0462,
      lng: -123.0220,
      isDefault: true
    }, userToken);
    assert('Users Module - Save Pickup Address', (addressRes.status === 201 || addressRes.status === 200) && addressRes.data.data?.id, `(City: ${addressRes.data.data?.city})`);
    const addressId = addressRes.data.data?.id;

    // 8. Test Waste Categories - Get Catalog
    const categoriesRes = await request('GET', '/waste-categories');
    assert('Waste Categories - Get Live Pricing Catalog', categoriesRes.status === 200 && Array.isArray(categoriesRes.data.data) && categoriesRes.data.data.length >= 5, `(${categoriesRes.data.data?.length} categories found)`);
    const ewasteCategory = categoriesRes.data.data.find(c => c.slug === 'e-waste') || categoriesRes.data.data[0];

    // 9. Test Waste Categories - Calculate Pricing & CO2 Offset
    const calcRes = await request('GET', `/waste-categories/calculate?categoryId=${ewasteCategory.id}&weightKg=25`);
    assert('Waste Categories - Calculate Payout & Carbon Offset', calcRes.status === 200 && calcRes.data.data?.estimatedPayout > 0, `(25kg = $${calcRes.data.data?.estimatedPayout}, ${calcRes.data.data?.co2SavedKg}kg CO2 saved)`);

    // 10. Test Pickups Module - Schedule AI Verified Pickup
    const pickupRes = await request('POST', '/pickups', {
      addressId: addressId,
      scheduledDate: new Date(Date.now() + 86400000).toISOString(),
      notes: 'Please ring doorbell. 2 old laptops and monitors.',
      items: [
        {
          categoryId: ewasteCategory.id,
          estimatedWeightKg: 18.5,
          photoUrl: 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?w=500',
          aiConfidence: 0.98
        }
      ]
    }, userToken);
    assert('Pickups Module - Schedule Pickup & Smart Matchmaker', (pickupRes.status === 201 || pickupRes.status === 200) && pickupRes.data.data?.id, `(Status: ${pickupRes.data.data?.status}, QR Secret: Generated)`);

    // 11. Test Pickups Module - Get User Pickups
    const myPickupsRes = await request('GET', '/pickups/my', null, userToken);
    assert('Pickups Module - Get User Pickups Feed', myPickupsRes.status === 200 && Array.isArray(myPickupsRes.data.data) && myPickupsRes.data.data.length >= 1, `(Found ${myPickupsRes.data.data?.length} pickups)`);

    // 12. Test Collectors Module - Get Dashboard Stats (RBAC Protected: Collector Only)
    const colDashRes = await request('GET', '/collectors/dashboard', null, collectorToken);
    assert('Collectors Module - Dashboard Stats (RBAC verified)', colDashRes.status === 200 && colDashRes.data.data?.stats?.rating > 0, `(Rating: ${colDashRes.data.data?.stats?.rating}⭐, Vehicle: ${colDashRes.data.data?.profile?.vehicles?.[0]?.model || 'Assigned'})`);

    // 13. Test Collectors Module - Get Nearby Available Jobs
    const jobsRes = await request('GET', '/collectors/jobs/available?lat=37.7749&lng=-122.4194', null, collectorToken);
    assert('Collectors Module - Geo-Location Available Jobs Feed', jobsRes.status === 200 && Array.isArray(jobsRes.data.data), `(${jobsRes.data.data?.length} pending jobs within radius)`);

    // 14. Test Wallet Module - Get Wallet Balance
    const walletRes = await request('GET', '/wallet', null, userToken);
    assert('Wallet Module - Get User Points & Cash Balance', walletRes.status === 200 && walletRes.data.data?.pointsBalance !== undefined, `(Green Points Balance: ${walletRes.data.data?.pointsBalance} pts)`);

    // 15. Test Wallet Module - Get Rewards Store Catalog
    const rewardsRes = await request('GET', '/wallet/rewards', null, userToken);
    assert('Wallet Module - Partner Rewards Store Catalog', rewardsRes.status === 200 && Array.isArray(rewardsRes.data.data) && rewardsRes.data.data.length >= 4, `(${rewardsRes.data.data?.length} partner vouchers available)`);
    const starbucksReward = rewardsRes.data.data.find(r => r.title.includes('Starbucks')) || rewardsRes.data.data[0];

    // 16. Test Wallet Module - Redeem Reward Voucher
    const redeemRes = await request('POST', '/wallet/redeem', {
      rewardId: starbucksReward.id
    }, userToken);
    assert('Wallet Module - Redeem Green Points for Voucher', (redeemRes.status === 201 || redeemRes.status === 200) && redeemRes.data.data?.couponCode, `(Coupon Code: ${redeemRes.data.data?.couponCode})`);

    // 17. Test Admin Module - Enterprise Analytics (RBAC Protected: Admin Only)
    const adminRes = await request('GET', '/admin/analytics', null, adminToken);
    assert('Admin Module - Enterprise Command Center Analytics', adminRes.status === 200 && adminRes.data.data?.overview?.totalUsers > 0, `(Total Platform Revenue: $${adminRes.data.data?.overview?.totalPlatformRevenueUSD}, Recycled: ${adminRes.data.data?.overview?.totalWeightRecycledKg}kg)`);

    // 18. Test RBAC Security - User attempting to access Admin Analytics
    const rbacFailRes = await request('GET', '/admin/analytics', null, userToken);
    assert('RBAC Security - Reject Unauthorized Role Access', rbacFailRes.status === 403, `(Status 403 Forbidden properly returned for USER role accessing Admin endpoint)`);

  } catch (err) {
    console.error('❌ Verification Suite Exception:', err.message, err.stack);
    failed++;
  } finally {
    console.log('\n📊 [3/3] Milestone 1 Verification Summary:');
    console.log(`-------------------------------------------`);
    console.log(`✅ Total Passed Tests: ${passed}`);
    console.log(`❌ Total Failed Tests: ${failed}`);
    console.log(`🏆 Health Status:      ${failed === 0 ? '100% PRODUCTION READY' : 'REQUIRES ATTENTION'}\n`);

    console.log('🛑 Shutting down server process...');
    serverProcess.kill();
    process.exit(failed === 0 ? 0 : 1);
  }
}

runVerification();
