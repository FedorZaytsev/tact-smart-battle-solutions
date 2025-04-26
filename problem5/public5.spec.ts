import '@ton/test-utils';
import { Blockchain, printTransactionFees } from '@ton/sandbox';
import { toNano } from '@ton/core';
import { Proposal } from '../output/solution5_Proposal';

it('solution5', async () => {
    const blockchain = await Blockchain.create();

    // create contract from init()
    const proposal = blockchain.openContract(
        await Proposal.fromInit({
            $$type: 'Init',
            proposalId: 0n,
            votingEndingAt: BigInt(Math.floor(Date.now() / 1000)) + 24n * 60n * 60n,
        }),
    );

    // deploy contract
    const deployer = await blockchain.treasury('deployer');
    await proposal.send(
        deployer.getSender(),
        {
            value: toNano('0.01'),
        },
        null, // empty message, handled by `receive()` without parameters
    );
    console.log("proposal contract balance after 0.01 init", await blockchain.getContract(proposal.address).then(c => c.balance));


    // vote
    const voter = await blockchain.treasury('voter');
    const voteResult = await proposal.send(
        voter.getSender(),
        { value: toNano('1000.1') },
        {
            $$type: 'Vote',
            value: true,
        },
    );
    //console.log("Proposal vote result", voteResult);
    printTransactionFees(voteResult.transactions);
    for (const tx of voteResult.transactions) {
        const computePhase = tx.description.computePhase.type === 'vm'
        ? tx.description.computePhase : undefined;
        const actionPhase = tx.description.actionPhase.type === 'vm'
        ? tx.description.actionPhase : undefined;
        console.log("tx gas fee", computePhase?.gasFees);
        console.log("tx gas used", computePhase?.gasUsed);
        console.log("tx action fee", actionPhase?.gasFees);
        console.log("tx action used", actionPhase?.gasUsed);
    }
    console.log("proposal contract balance after 0.1 ton vote", await blockchain.getContract(proposal.address).then(c => c.balance));


    // the vote was counted
    expect(await proposal.getProposalState()).toMatchObject({ yesCount: 1n, noCount: 0n });
});