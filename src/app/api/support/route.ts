import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { email, subject, description } = await request.json();

    if (!email || !subject || !description) {
      return NextResponse.json(
        { error: "Email, subject, and description are required." },
        { status: 400 }
      );
    }

    // Read the secret token securely from server-side environment variables
    const accessToken = process.env.INTERCOM_ACCESS_TOKEN;
    const ticketTypeId = "";

    if (!accessToken) {
      console.error("❌ Intercom access token is missing.");
      return NextResponse.json(
        { error: "Server configuration error. Intercom Access Token is not set." },
        { status: 500 }
      );
    }

    let contactId = "";

    // 1. Search for existing contact in Intercom securely
    try {
      const searchResponse = await fetch("https://api.intercom.io/contacts/search", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
          Accept: "application/json",
          "Intercom-Version": "2.9",
        },
        body: JSON.stringify({
          query: {
            field: "email",
            operator: "=",
            value: email,
          },
        }),
      });

      if (searchResponse.ok) {
        const searchData = await searchResponse.json();
        if (searchData.data && searchData.data.length > 0) {
          contactId = searchData.data[0].id;
        }
      }
    } catch (searchError) {
      console.warn("Server-side Intercom contact search warning:", searchError);
    }

    // 2. If contact does not exist, create a new contact securely
    if (!contactId) {
      try {
        const createContactResponse = await fetch("https://api.intercom.io/contacts", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
            Accept: "application/json",
            "Intercom-Version": "2.9",
          },
          body: JSON.stringify({
            role: "user",
            email,
          }),
        });

        if (createContactResponse.ok) {
          const newContact = await createContactResponse.json();
          contactId = newContact.id;
        } else {
          const errText = await createContactResponse.text();
          console.error("Failed to create Intercom contact:", errText);
          throw new Error("Contact creation failed");
        }
      } catch {
        return NextResponse.json(
          { error: "Failed to find or register user contact in Intercom." },
          { status: 500 }
        );
      }
    }

    // 3. Create Ticket or fall back to Conversation if Ticket Type ID is missing or fails
    let isTicketCreated = false;
    let resultId = "";

    if (ticketTypeId && contactId) {
      try {
        const ticketPayload = {
          ticket_type_id: ticketTypeId,
          contacts: [{ id: contactId }],
          ticket_attributes: {
            _default_title_: subject,
            _default_description_: description,
          },
        };

        const ticketResponse = await fetch("https://api.intercom.io/tickets", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
            Accept: "application/json",
            "Intercom-Version": "2.9",
          },
          body: JSON.stringify(ticketPayload),
        });

        if (ticketResponse.ok) {
          const ticketData = await ticketResponse.json();
          resultId = ticketData.id;
          isTicketCreated = true;
        } else {
          const errText = await ticketResponse.text();
          console.warn("Intercom ticket creation failed, falling back to conversation:", errText);
        }
      } catch (ticketError) {
        console.warn("Intercom ticket API error, trying conversation fallback:", ticketError);
      }
    }

    // 4. Fallback: Create a direct Conversation if Tickets API fails or is not configured
    if (!isTicketCreated && contactId) {
      try {
        const conversationPayload = {
          from: {
            type: "user",
            id: contactId,
          },
          body: `<h3>Тема: ${subject}</h3><p>${description.replace(/\n/g, "<br>")}</p>`,
        };

        const convResponse = await fetch("https://api.intercom.io/conversations", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
            Accept: "application/json",
            "Intercom-Version": "2.9",
          },
          body: JSON.stringify(conversationPayload),
        });

        if (convResponse.ok) {
          const convData = await convResponse.json();
          resultId = convData.id;
        } else {
          const errText = await convResponse.text();
          console.error("Intercom fallback conversation creation failed:", errText);
          return NextResponse.json(
            { error: "Failed to create ticket or conversation in Intercom." },
            { status: 502 }
          );
        }
      } catch (convError) {
        console.error("Intercom fallback conversation error:", convError);
        return NextResponse.json(
          { error: "Failed to connect to Intercom services." },
          { status: 502 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      ticketCreated: isTicketCreated,
      id: resultId,
    });
  } catch (error) {
    console.error("Server Support API error:", error);
    return NextResponse.json(
      { error: "Internal server error occurred." },
      { status: 500 }
    );
  }
}
