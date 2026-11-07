const BASE_URL = "http://localhost:5000";

export async function registerCustomer(name, email, password, phone) {
  const response = await fetch(
    `${BASE_URL}/api/auth/register/customer`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        email,
        password,
        phone,
      }),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Register gagal");
  }

  return data;
}