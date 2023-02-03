import { expect } from "chai";
import hre, { ethers } from "hardhat";
import "@nomiclabs/hardhat-ethers";
import { buildSafeTransaction } from "../src/utils/execution";
import { BigNumber } from "ethers";
import { benchmark, Contracts } from "./utils/setup";

benchmark("ERC1155", [
    {
        name: "transfer",
        prepare: async (contracts: Contracts, target: string, nonce: number) => {
            const [, , , , user5] = await hre.ethers.getSigners();
            const token = contracts.additions.token;
            await token.mint(target, 23, 1337, "0x");
            const data = token.interface.encodeFunctionData("safeTransferFrom", [target, user5.address, 23, 500, "0x"]);
            return buildSafeTransaction({ to: token.address, data, safeTxGas: 1000000, nonce });
        },
        after: async (contracts: Contracts) => {
            const [, , , , user5] = await hre.ethers.getSigners();
            expect(await contracts.additions.token.balanceOf(user5.address, 23)).to.be.deep.eq(BigNumber.from(500));
        },
        fixture: async () => {
            const tokenFactory = await ethers.getContractFactory("ERC1155Token");
            return {
                token: await tokenFactory.deploy(),
            };
        },
    },
]);
