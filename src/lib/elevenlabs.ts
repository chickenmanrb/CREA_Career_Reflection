const SIGNED_URL_ENDPOINT = "https://api.elevenlabs.io/v1/convai/conversation/get-signed-url";

export async function fetchSignedUrl(agentId: string, apiKey: string) {
  const url = `${SIGNED_URL_ENDPOINT}?agent_id=${encodeURIComponent(agentId)}`;
  const response = await fetch(url, {
    headers: {
      "xi-api-key": apiKey,
    },
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(`Failed to fetch signed URL (${response.status}): ${body}`);
  }

  const data = await response.json();
  if (!data?.signed_url) {
    throw new Error("ElevenLabs did not return a signed URL");
  }

  return data.signed_url as string;
}
