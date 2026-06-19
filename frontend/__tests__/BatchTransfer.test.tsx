import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { BatchTransfer } from "@/components/BatchTransfer";

jest.mock("@/config/wagmi", () => ({
  arcTestnet: {
    blockExplorers: { default: { url: "https://testnet.arcscan.app" } },
  },
}));

const writeContractAsync = jest.fn().mockResolvedValue("0xtxhash");

jest.mock("wagmi", () => ({
  useAccount: () => ({
    address: "0x241a0a5dacedbd30d51aa380bc699cca6bb4a627",
    isConnected: true,
    chainId: 5042002,
  }),
  useBalance: () => ({
    data: {
      value: 2000000000000000000n,
      formatted: "2",
      symbol: "USDC",
    },
    isLoading: false,
  }),
  useSimulateContract: () => ({ error: null }),
  useWriteContract: () => ({
    writeContractAsync,
    isPending: false,
  }),
  useWaitForTransactionReceipt: () => ({
    isPending: false,
    isSuccess: false,
  }),
}));

function generateAddresses(count: number) {
  return Array.from({ length: count }, () => {
    const hex = Array.from({ length: 40 }, () =>
      Math.floor(Math.random() * 16).toString(16)
    ).join("");
    return `0x${hex}` as `0x${string}`;
  });
}

describe("BatchTransfer", () => {
  beforeEach(() => {
    writeContractAsync.mockClear();
  });

  it("parses 20 recipients and calls batchTransferNative", async () => {
    const addresses = generateAddresses(20);
    render(
      <BatchTransfer contractAddress="0x813e553133a2543485e904321efffc8d9a133940" />
    );

    const amountInput = screen.getByPlaceholderText("0.05");
    const textarea = screen.getByPlaceholderText(/Paste one address/);
    const submit = screen.getByRole("button", { name: /Send batch/i });

    fireEvent.change(amountInput, { target: { value: "0.05" } });
    fireEvent.change(textarea, { target: { value: addresses.join("\n") } });

    await waitFor(() => {
      expect(screen.getByText("20 / 100")).toBeInTheDocument();
    });

    expect(submit).not.toBeDisabled();

    fireEvent.click(submit);

    await waitFor(() => {
      expect(writeContractAsync).toHaveBeenCalledTimes(1);
    });

    const call = writeContractAsync.mock.calls[0][0];
    expect(call.functionName).toBe("batchTransferNative");
    expect(call.address).toBe("0x813e553133a2543485e904321efffc8d9a133940");
    expect(call.args[0]).toHaveLength(20);
    expect(call.args[1]).toBe(50000000000000000n);
    expect(call.value).toBe(1000000000000000000n);
  });
});
