export async function POST() {
 
  
    const sampleData = {
      title: "Hello",
      body: "Next.js API test",
      userId: 1,
    };

   
    const res = await fetch("https://jsonplaceholder.typicode.com/posts", {
        method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(sampleData),
    });

    const data = await res.json();

  
    return new Response(JSON.stringify(data), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  }

