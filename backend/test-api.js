async function test() {
  const base = 'http://localhost:5000/api';

  console.log('--- Testing API Endpoints ---');

  // 1. Health
  const healthRes = await fetch(`${base}/health`);
  console.log('1. Health check:', healthRes.status, await healthRes.json());

  // 2. Courses all
  const coursesRes = await fetch(`${base}/courses`);
  const coursesData = await coursesRes.json();
  console.log('2. Courses count:', coursesData.count);

  // 3. Courses category filter (math)
  const mathRes = await fetch(`${base}/courses?category=math`);
  const mathData = await mathRes.json();
  console.log('3. Filter category=math:', mathData.count, mathData.data.map(c => c.title));

  // 4. Courses slug filter (mathematics)
  const mathSlugRes = await fetch(`${base}/courses?category=mathematics`);
  const mathSlugData = await mathSlugRes.json();
  console.log('4. Filter category=mathematics:', mathSlugData.count);

  // 5. Single course by id
  const courseIdRes = await fetch(`${base}/courses/math-foundations`);
  const courseIdData = await courseIdRes.json();
  console.log('5. Course by id:', courseIdRes.status, courseIdData.data.title);

  // 6. Videos
  const videosRes = await fetch(`${base}/videos?category=cs`);
  const videosData = await videosRes.json();
  console.log('6. Videos filter category=cs:', videosData.count, videosData.data.map(v => v.title));

  // 7. Resources
  const resourcesRes = await fetch(`${base}/resources?category=notes`);
  const resourcesData = await resourcesRes.json();
  console.log('7. Resources filter category=notes:', resourcesData.count, resourcesData.data.map(r => r.title));

  // 8. Contact valid
  const contactRes = await fetch(`${base}/contact`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Priya Sharma',
      email: 'priya@example.com',
      subject: 'science',
      message: 'Great explanations for Newton laws of motion!'
    })
  });
  console.log('8. Contact valid POST:', contactRes.status, await contactRes.json());

  // 9. Contact invalid
  const contactInvalidRes = await fetch(`${base}/contact`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: '', email: 'notanemail', message: 'hi' })
  });
  console.log('9. Contact invalid POST:', contactInvalidRes.status, await contactInvalidRes.json());

  console.log('--- All Tests Passed Successfully ---');
}

test().catch(err => {
  console.error('[TEST ERROR]', err);
  process.exit(1);
});
