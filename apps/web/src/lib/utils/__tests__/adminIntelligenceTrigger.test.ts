import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock dependencies
const mockAuth = vi.fn();
vi.mock("@/auth", () => ({
  auth: () => mockAuth()
}));

const mockRedisSetNx = vi.fn();
const mockRedisGet = vi.fn();
const mockRedisSet = vi.fn();
const mockRedisDelIfOwner = vi.fn();

vi.mock("@/lib/redis", () => ({
  redis: {
    setNX: (...args: any[]) => mockRedisSetNx(...args),
    get: (...args: any[]) => mockRedisGet(...args),
    set: (...args: any[]) => mockRedisSet(...args),
    delIfOwner: (...args: any[]) => mockRedisDelIfOwner(...args),
  }
}));

const mockPollAllProviders = vi.fn();
vi.mock("@/lib/intelligence/live/ingestion.service", () => ({
  liveIngestionService: {
    pollAllProviders: () => mockPollAllProviders()
  }
}));

vi.mock("@/lib/mongoose", () => ({
  default: vi.fn()
}));

// Mock `after` from next/server to immediately execute
vi.mock("next/server", async (importOriginal) => {
  const actual = await importOriginal<any>();
  return {
    ...actual,
    after: (fn: any) => fn(),
    NextResponse: {
      json: (data: any, init?: any) => {
        return {
          status: init?.status || 200,
          json: async () => data
        };
      }
    }
  };
});

import { POST } from "../../../app/api/admin/intelligence/run/route";

describe("Admin Intelligence Run Trigger", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("rejects unauthorized access", async () => {
    mockAuth.mockResolvedValue(null);
    const response: any = await POST();
    expect(response.status).toBe(401);
  });

  it("rejects non-admin users", async () => {
    mockAuth.mockResolvedValue({ user: { role: "editor" } });
    const response: any = await POST();
    expect(response.status).toBe(401);
  });

  it("returns already_running if lock is held", async () => {
    mockAuth.mockResolvedValue({ user: { role: "admin" } });
    // Simulate lock already exists
    mockRedisSetNx.mockResolvedValue(null);
    
    const response: any = await POST();
    const data = await response.json();
    
    expect(data.success).toBe(false);
    expect(data.status).toBe("already_running");
    expect(mockPollAllProviders).not.toHaveBeenCalled();
  });

  it("acquires shared lock and executes pipeline", async () => {
    mockAuth.mockResolvedValue({ user: { role: "admin" } });
    // Simulate successful lock acquisition
    mockRedisSetNx.mockResolvedValue("OK");
    
    mockPollAllProviders.mockResolvedValue({
      fetched: 12,
      duplicates: 10,
      inserted: 2,
      archived: 0,
      failed: 0,
      providersHealthy: 5,
      providersFailed: 0
    });
    
    const response: any = await POST();
    const data = await response.json();
    
    expect(data.success).toBe(true);
    expect(data.status).toBe("started");
    
    // Verify lock was requested with the correct key
    expect(mockRedisSetNx).toHaveBeenCalledWith("intelligence:worker:lock", expect.any(String), 300);
    
    // Wait a tick for the `after` execution (mocked to run immediately)
    await new Promise(r => setTimeout(r, 10));
    
    // Verify intelligence was run
    expect(mockPollAllProviders).toHaveBeenCalled();
    
    // Verify lock was released
    expect(mockRedisDelIfOwner).toHaveBeenCalledWith("intelligence:worker:lock", expect.any(String));
  });
});
