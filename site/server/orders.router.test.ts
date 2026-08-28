import { beforeEach, describe, expect, it, vi } from "vitest";
import type { TrpcContext } from "./_core/context";

const { getOrdersForCustomer } = vi.hoisted(() => ({ getOrdersForCustomer: vi.fn() }));
vi.mock("./db", () => ({ getOrdersForCustomer }));

import { appRouter } from "./routers";

function contextFor(user: TrpcContext["user"]): TrpcContext {
  return { user, req: { protocol: "https", headers: {} } as TrpcContext["req"], res: {} as TrpcContext["res"] };
}

describe("orders.mine", () => {
  beforeEach(() => vi.clearAllMocks());

  it("retorna somente os metadados de pedido do cliente autenticado", async () => {
    getOrdersForCustomer.mockResolvedValue([{ id: 7, customerId: 12, status: "pending_review" }]);
    const caller = appRouter.createCaller(contextFor({ id: 12, openId: "customer", name: "Cliente", email: null, loginMethod: "manus", role: "user", createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date() }));
    await expect(caller.orders.mine()).resolves.toEqual([{ id: 7, customerId: 12, status: "pending_review" }]);
    expect(getOrdersForCustomer).toHaveBeenCalledWith(12);
  });

  it("rejeita a consulta quando não há sessão autenticada", async () => {
    const caller = appRouter.createCaller(contextFor(null));
    await expect(caller.orders.mine()).rejects.toMatchObject({ code: "UNAUTHORIZED" });
    expect(getOrdersForCustomer).not.toHaveBeenCalled();
  });
});
