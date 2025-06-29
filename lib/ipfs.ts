import { siteConfig } from "@/config/site";
import axios from "axios";

// Convert IPFS hash to ipfs:// URI
export function ipfsHashToIpfsUri(ipfsHash: string): string {
  return `ipfs://${ipfsHash}`;
}

// Convert ipfs:// URI to HTTP URI using the Pinata gateway
export function ipfsUriToHttpUri(ipfsUri?: string): string {
  if (!ipfsUri) {
    throw new Error(`Invalid IPFS URI: ${ipfsUri}`);
  }

  return ipfsUri.replace(
    "ipfs://",
    `https://${process.env.NEXT_PUBLIC_PINATA_GATEWAY}/ipfs/`
  );
}

// Upload a JSON object to IPFS
export async function uploadJsonToIpfs(json: Record<string, unknown>): Promise<string> {
  const response = await axios.post(
    "https://api.pinata.cloud/pinning/pinJSONToIPFS",
    json,
    {
      headers: {
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_PINATA_JWT}`,
        "Content-Type": "application/json",
      },
      params: {
        pinataMetadata: JSON.stringify({
          name: `${siteConfig.name} - JSON`,
        }),
      },
    }
  );

  return ipfsHashToIpfsUri(response.data.IpfsHash);
}

// Upload a file to IPFS
export async function uploadFileToIpfs(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file, file.name);

  const response = await axios.post(
    "https://api.pinata.cloud/pinning/pinFileToIPFS",
    formData,
    {
      headers: {
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_PINATA_JWT}`,
      },
    }
  );

  return ipfsHashToIpfsUri(response.data.IpfsHash);
}

// Load JSON from IPFS using the CID or ipfs:// URI
export async function loadJsonFromIpfs(cid: string): Promise<Record<string, unknown>> {
  const response = await axios.get(ipfsUriToHttpUri(cid));

  if (response.data?.errors) {
    throw new Error(`Failed to load JSON from IPFS: ${response.data.errors}`);
  }

  return response.data;
}
