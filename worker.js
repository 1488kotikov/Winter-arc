export default {
  async fetch(request, env) {

    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };

    // CORS preflight
    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: corsHeaders,
      });
    }

    // Создание платежа
    if (request.method === "POST") {
      try {

        const idempotenceKey = crypto.randomUUID();

        const response = await fetch(
          "https://api.yookassa.ru/v3/payments",
          {
            method: "POST",

            headers: {
              "Authorization":
                "Basic " +
                btoa(
                  `${env.YOOKASSA_SHOP_ID}:${env.YOOKASSA_SECRET_KEY}`
                ),

              "Content-Type": "application/json",
              "Idempotence-Key": idempotenceKey,
            },

            body: JSON.stringify({
              amount: {
                value: "990.00",
                currency: "RUB",
              },

              capture: true,

              confirmation: {
                type: "redirect",
                return_url:
                  "https://зимняяарка.рф/success.html",
              },

              description:
                "Участие в WINTER ARC — 100 дней",

              metadata: {
                product: "winter_arc_2026",
              },
            }),
          }
        );

        const data = await response.json();

        if (!response.ok) {
          return new Response(
            JSON.stringify({
              error: "Ошибка ЮKassa",
              details: data,
            }),
            {
              status: 500,
              headers: {
                "Content-Type": "application/json",
                ...corsHeaders,
              },
            }
          );
        }

        return new Response(
          JSON.stringify({
            confirmation_url:
              data.confirmation.confirmation_url,
          }),
          {
            status: 200,
            headers: {
              "Content-Type": "application/json",
              ...corsHeaders,
            },
          }
        );

      } catch (error) {

        return new Response(
          JSON.stringify({
            error: error.message,
          }),
          {
            status: 500,
            headers: {
              "Content-Type": "application/json",
              ...corsHeaders,
            },
          }
        );
      }
    }

    return new Response(
      "Winter Arc Payment Worker",
      {
        status: 200,
        headers: corsHeaders,
      }
    );
  },
};
