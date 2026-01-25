import fetch from 'node-fetch';

const API_URL = 'http://localhost:4000';

async function testLogin() {
    console.log('\n=== Testing Login ===');

    // You need to replace these with actual credentials
    const credentials = {
        name: 'testuser',  // REPLACE WITH ACTUAL USERNAME
        password: 'testpass'  // REPLACE WITH ACTUAL PASSWORD
    };

    try {
        const response = await fetch(`${API_URL}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(credentials)
        });

        const data = await response.json();

        if (!response.ok) {
            console.error('❌ Login failed:', data.error);
            return;
        }

        console.log('\n✅ Login successful!');
        console.log('\nUser data returned:');
        console.log(JSON.stringify(data.user, null, 2));
        console.log('\n📍 University value:', data.user.university);
        console.log('📍 University type:', typeof data.user.university);

        // Now test fetching university users
        console.log('\n=== Testing University Users Fetch ===');
        const uniResponse = await fetch(`${API_URL}/api/auth/university-users`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ university: data.user.university })
        });

        const uniData = await uniResponse.json();

        if (!uniResponse.ok) {
            console.error('❌ University users fetch failed:', uniData.error);
            return;
        }

        console.log(`\n✅ Found ${uniData.users?.length || 0} users`);
        if (uniData.users && uniData.users.length > 0) {
            console.log('\nFirst 3 users:');
            uniData.users.slice(0, 3).forEach((u, i) => {
                console.log(`${i + 1}. ${u.name} - ${u.stats?.totalSolved || 0} solved`);
            });
        }

    } catch (err) {
        console.error('❌ Error:', err.message);
    }
}

testLogin();
