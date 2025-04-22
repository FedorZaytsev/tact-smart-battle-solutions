import '@ton/test-utils';
import { Blockchain } from '@ton/sandbox';
import { toNano } from '@ton/core';
import { Proposal } from '../output/solution1_Proposal';


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

it('solution1', async () => {
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
    await vote(blockchain, proposal, 'voter', true);
    //console.log(result);

    // the vote was counted
    expect(await proposal.getProposalState()).toMatchObject({ yesCount: 1n, noCount: 0n });
});


it('solution2', async () => {
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
    await vote(blockchain, proposal, 'voter', true);
    await vote(blockchain, proposal, 'voter', true);
    await vote(blockchain, proposal, 'voter2', true);
    await vote(blockchain, proposal, 'voter3', false);
    //console.log(result);

    // the vote was counted
    expect(await proposal.getProposalState()).toMatchObject({ yesCount: 2n, noCount: 1n });
});



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

    for (let i = 0; i < 70; i++) {
        await vote(blockchain, proposal, 'voter'+i, true);
    }
    for (let i = 0; i < 70; i++) {
        await vote(blockchain, proposal, 'voterNO'+i, false);
    }
    //console.log(result);

    // the vote was counted
    expect(await proposal.getProposalState()).toMatchObject({ yesCount: 70n, noCount: 30n });
});



it('solution4', async () => {
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

    for (let i = 0; i < 70; i++) {
        await vote(blockchain, proposal, 'voter', true);
    }
    for (let i = 0; i < 70; i++) {
        await vote(blockchain, proposal, 'voterNO'+i, false);
    }
    //console.log(result);

    // the vote was counted
    expect(await proposal.getProposalState()).toMatchObject({ yesCount: 1n, noCount: 70n });
});


it('solution5', async () => {
    const blockchain = await Blockchain.create();

    // create contract from init()
    const proposal = blockchain.openContract(
        await Proposal.fromInit({
            $$type: 'Init',
            proposalId: 0n,
            votingEndingAt: BigInt(Math.floor(Date.now() / 1000)) + 1n,
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

    for (let i = 0; i < 70; i++) {
        await vote(blockchain, proposal, 'voter'+i, true);
    }
    //sleep 1 seconds
    await new Promise(resolve => setTimeout(resolve, 2000));
    for (let i = 0; i < 70; i++) {
        await vote(blockchain, proposal, 'voterNO'+i, false);
    }
    //console.log(result);

    // the vote was counted
    expect(await proposal.getProposalState()).toMatchObject({ yesCount: 70n, noCount: 0n });
});




it('solution6', async () => {
    const blockchain = await Blockchain.create();

    // create contract from init()
    const proposal = blockchain.openContract(
        await Proposal.fromInit({
            $$type: 'Init',
            proposalId: 0n,
            votingEndingAt: BigInt(Math.floor(Date.now() / 1000)) + 10n,
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

    for (let i = 0; i < 70; i++) {
        await vote(blockchain, proposal, 'voter'+i, true);
    }

    const proposal2 = blockchain.openContract(
        await Proposal.fromInit({
            $$type: 'Init',
            proposalId: 1n,
            votingEndingAt: BigInt(Math.floor(Date.now() / 1000)) + 10n,
        }),
    );

    // deploy contract
    await proposal2.send(
        deployer.getSender(),
        {
            value: toNano('0.01'),
        },
        null, // empty message, handled by `receive()` without parameters
    );
    await vote(blockchain, proposal2, 'voter1', true);
    await vote(blockchain, proposal2, 'voter2', true);
    await vote(blockchain, proposal2, 'voter3', true);


    // the vote was counted
    expect(await proposal.getProposalState()).toMatchObject({ yesCount: 70n, noCount: 0n });
    expect(await proposal2.getProposalState()).toMatchObject({ yesCount: 3n, noCount: 0n });
});

