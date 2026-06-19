import { render, screen, waitFor } from "@testing-library/react";
import Home from "../app/page";

jest.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
}));

jest.mock("@/components/Header", () => ({
  Header: () => <header data-testid="header">NanoCLI</header>,
}));

jest.mock("@/components/GradientBackground", () => ({
  GradientBackground: () => <div data-testid="gradient-background" />,
}));

jest.mock("@/components/ContractCard", () => ({
  ContractCard: ({ address }: { address?: string }) => (
    <div data-testid="contract-card">{address || "no-address"}</div>
  ),
}));

jest.mock("@/components/BatchTransfer", () => ({
  BatchTransfer: ({ contractAddress }: { contractAddress?: string }) => (
    <div data-testid="batch-transfer">{contractAddress || "no-address"}</div>
  ),
}));

jest.mock("@/components/Features", () => ({
  Features: () => <div>Features</div>,
}));

jest.mock("@/components/AgentBanner", () => ({
  AgentBanner: () => <div>AgentBanner</div>,
}));

const mockFetch = jest.fn(() =>
  Promise.resolve({
    json: () =>
      Promise.resolve({
        contractAddress: "0x813e553133a2543485e904321efffc8d9a133940",
      }),
  })
);
(global as any).fetch = mockFetch;

describe("Home page", () => {
  it("renders the product header and loads the deployed contract", async () => {
    render(<Home />);

    expect(screen.getByText("Batch payments on")).toBeInTheDocument();
    expect(screen.getByText("Features")).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByTestId("header")).toHaveTextContent("NanoCLI");
    });

    await waitFor(() => {
      expect(screen.getByTestId("batch-transfer")).toHaveTextContent(
        "0x813e553133a2543485e904321efffc8d9a133940"
      );
    });

    await waitFor(() => {
      expect(screen.getByTestId("contract-card")).toHaveTextContent(
        "0x813e553133a2543485e904321efffc8d9a133940"
      );
    });
  });
});
