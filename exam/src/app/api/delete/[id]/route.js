export async function DELETE(request, { params }) {
  const { id } = params;

  
    const res = await fetch(`https://jsonplaceholder.typicode.com/posts/${id}`, {
      method: "DELETE",
    });

   

   
    const data = await res.json();

    return new Response(
      JSON.stringify({
        message: `deleted successfully`,
        response: data,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
