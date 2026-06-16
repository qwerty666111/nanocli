import { render, screen } from "@testing-library/react";
import Home from "../app/page";

jest.mock("@/components/ConnectButton", () => ({
  ConnectButton: () => <button>Connect Wallet</button>,
}));

jest.mock("@/components/Balance", () => ({
  Balance: () => <div>Balance</div>,
}));

jest.mock("@/components/BatchForm", () => ({
  BatchForm: () => <form>Batch Form</form>,
}));

const mockFetch = jest.fn(() =>
  Promise.resolve({ json: () => Promise.resolve({ contractAddress: "" }) })
);
(global as any).fetch = mockFetch;

describe("Home page", () => {
  it("renders the NanoCLI header and batch form", () => {
    render(<Home />);

    expect(screen.getByText("NanoCLI")).toBeInTheDocument();
    expect(screen.getByText("Batch USDC micro-transfers")).toBeInTheDocument();
    expect(screen.getByText("Connect Wallet")).toBeInTheDocument();
    expect(screen.getByText("Batch Form")).toBeInTheDocument();
    expect(screen.getByText("Deploy contract")).toBeInTheDocument();
  });
});
