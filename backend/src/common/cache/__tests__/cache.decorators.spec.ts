import { Cacheable, CacheEvict } from "../cache.decorators";

class MockService {
  public callCount = 0;
  public cacheService = {
    wrap: jest.fn(async (key, fetcher) => fetcher()),
    delByPattern: jest.fn(async () => 1),
    del: jest.fn(async () => {}),
  };

  @Cacheable({ keyPrefix: "test:item", ttl: 120 })
  async getItem(id: string) {
    this.callCount++;
    return { id, name: "Test Item" };
  }

  @CacheEvict({ keyPrefix: "test:item", pattern: true })
  async updateItem(id: string, name: string) {
    return { id, name };
  }
}

describe("Cacheable and CacheEvict Decorators (TDD Unit Suite)", () => {
  let service: MockService;

  beforeEach(() => {
    service = new MockService();
    jest.clearAllMocks();
  });

  it("should call cacheService.wrap when @Cacheable method is invoked", async () => {
    const result = await service.getItem("item-1");
    expect(result).toEqual({ id: "item-1", name: "Test Item" });
    expect(service.cacheService.wrap).toHaveBeenCalledTimes(1);
    expect(service.cacheService.wrap).toHaveBeenCalledWith(
      'th:cache:test:item:getItem:["item-1"]',
      expect.any(Function),
      120,
    );
  });

  it("should call cacheService.delByPattern when @CacheEvict method with pattern=true is invoked", async () => {
    const result = await service.updateItem("item-1", "Updated Item");
    expect(result).toEqual({ id: "item-1", name: "Updated Item" });
    expect(service.cacheService.delByPattern).toHaveBeenCalledTimes(1);
    expect(service.cacheService.delByPattern).toHaveBeenCalledWith(
      "th:cache:test:item:*",
    );
  });
});
