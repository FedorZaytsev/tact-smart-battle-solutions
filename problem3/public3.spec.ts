import '@ton/test-utils';
import { Blockchain, printTransactionFees } from '@ton/sandbox';
import { toNano } from '@ton/core';
import { Proposal } from '../output/solution3_Proposal';

async function vote(blockchain: Blockchain, proposal: any, senderName: any, value: boolean) {
    return await proposal.send(
        (await blockchain.treasury(senderName)).getSender(),
        { value: toNano('0.1') },
        {
            $$type: 'Vote',
            value: value,
        },
    );
}


it('solution3', async () => {
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

    // vote
    const voter = await blockchain.treasury('voter');
    const voteResult = await proposal.send(
        voter.getSender(),
        { value: toNano('0.1') },
        {
            $$type: 'Vote',
            value: true,
        },
    );
    printTransactionFees(voteResult.transactions);
    var totalGasFees = 0;
    var totalGasUsed = 0;
    for (const tx of voteResult.transactions) {
        const computePhase = tx.description.computePhase.type === 'vm'
        ? tx.description.computePhase : undefined;
        console.log("tx gas fee", computePhase?.gasFees);
        console.log("tx gas used", computePhase?.gasUsed);
        totalGasFees += Number(computePhase?.gasFees ?? 0n);
        totalGasUsed += Number(computePhase?.gasUsed ?? 0n);
    }
    console.log("proposal contract balance after 0.1 ton vote", await blockchain.getContract(proposal.address).then(c => c.balance));
    console.log("total gas fees", totalGasFees);
    console.log("total gas used", totalGasUsed);
    // the vote was counted
    expect(await proposal.getProposalState()).toMatchObject({ yesCount: 1n, noCount: 0n });
});

/*
it('solution3_1', async () => {
    const blockchain = await Blockchain.create();

    const currentTime = BigInt(Math.floor(Date.now() / 1000));
    blockchain.now = Number(currentTime);
    // create contract from init()
    const proposal = blockchain.openContract(
        await Proposal.fromInit({
            $$type: 'Init',
            proposalId: 0n,
            votingEndingAt: currentTime,
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


    for (let i = 0; i < 200; i++) {
        await vote(blockchain, proposal, 'voter'+i, true);
        await vote(blockchain, proposal, 'voter'+i, false);
    }
    //sleep 1 seconds
    blockchain.now = Number(currentTime)+1;
    //console.log(result);

    // the vote was counted
    expect(await proposal.getProposalState()).toMatchObject({ yesCount: 200n, noCount: 0n });
});
//*/
/*
it('solution3_2', async () => {
    const blockchain = await Blockchain.create();

    const currentTime = BigInt(Math.floor(Date.now() / 1000));
    blockchain.now = Number(currentTime);
    // create contract from init()
    const proposal = blockchain.openContract(
        await Proposal.fromInit({
            $$type: 'Init',
            proposalId: 0n,
            votingEndingAt: currentTime,
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

    await vote(blockchain, proposal, 'voter', true);
    const result = await vote(blockchain, proposal, 'voter', false);
    console.log(result);
    // the vote was counted
    expect(await proposal.getProposalState()).toMatchObject({ yesCount: 1n, noCount: 0n });
});

//*/