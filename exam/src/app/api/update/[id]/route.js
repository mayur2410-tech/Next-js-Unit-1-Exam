export async function PUT(request, { params }) {
  const { id } = params;

  
    const updatedData = {
      title: "Updated Title",
      body: "This is the updated body for the post.",
      userId: 1,
    };

    const res = await fetch(`https://jsonplaceholder.typicode.com/posts/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updatedData),
    });

    const data = await res.json();

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }

