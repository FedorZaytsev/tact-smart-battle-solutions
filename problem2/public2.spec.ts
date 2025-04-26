import '@ton/test-utils';
import { Blockchain } from '@ton/sandbox';
import { toNano } from '@ton/core';
import { Proposal } from '../output/solution2_Proposal';
import { ProposalMaster } from '../output/solution2_ProposalMaster';

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

it('solution2', async () => {
    const blockchain = await Blockchain.create();

    // init master contract
    const proposalMaster = blockchain.openContract(
        await ProposalMaster.fromInit(),
    );

    // deploy master contract
    const masterDeployer = await blockchain.treasury('deployer');
    const masterDeploy = await proposalMaster.send(
        masterDeployer.getSender(),
        {
            value: toNano('0.01'),
        },
        null, // empty message, handled by `receive()` without parameters
    );

    // create proposal
    const currentTime = BigInt(Math.floor(Date.now() / 1000));
    const proposalDeploy = await proposalMaster.send(
        masterDeployer.getSender(),
        {
            value: toNano('0.1'),
            bounce: false,
        },
        {
            $$type: 'DeployNewProposal',
            votingEndingAt: currentTime + 24n * 60n * 60n,
        },
    );

    // vote
    const voter = await blockchain.treasury('voter');
    const proposal = blockchain.openContract(
        await Proposal.fromInit({
            $$type: 'ProposalInit',
            master: proposalMaster.address,
            proposalId: 0n,
        }),
    );
    await vote(blockchain, proposal, 'voter', true);

    // the vote was counted
    expect(await proposal.getProposalState()).toMatchObject({ yesCount: 1n, noCount: 0n });
});



it('solution2_2', async () => {
    const blockchain = await Blockchain.create();

    // init master contract
    const proposalMaster = blockchain.openContract(
        await ProposalMaster.fromInit(),
    );

    // deploy master contract
    const masterDeployer = await blockchain.treasury('deployer');
    const masterDeploy = await proposalMaster.send(
        masterDeployer.getSender(),
        {
            value: toNano('0.01'),
        },
        null, // empty message, handled by `receive()` without parameters
    );

    // create proposal
    const currentTime = BigInt(Math.floor(Date.now() / 1000));
    const proposalDeploy = await proposalMaster.send(
        masterDeployer.getSender(),
        {
            value: toNano('0.1'),
            bounce: false,
        },
        {
            $$type: 'DeployNewProposal',
            votingEndingAt: currentTime + 24n * 60n * 60n,
        },
    );

    // vote
    const proposal = blockchain.openContract(
        await Proposal.fromInit({
            $$type: 'ProposalInit',
            master: proposalMaster.address,
            proposalId: 0n,
        }),
    );
    
    for (let i = 0; i < 70; i++) {
        await vote(blockchain, proposal, 'voter'+i, true);
    }
    for (let i = 0; i < 70; i++) {
        await vote(blockchain, proposal, 'voterNO'+i, false);
    }

    // the vote was counted
    expect(await proposal.getProposalState()).toMatchObject({ yesCount: 70n, noCount:30n });
});





it('solution2_3', async () => {
    const blockchain = await Blockchain.create();

    // init master contract
    const proposalMaster = blockchain.openContract(
        await ProposalMaster.fromInit(),
    );

    // deploy master contract
    const masterDeployer = await blockchain.treasury('deployer');
    const masterDeploy = await proposalMaster.send(
        masterDeployer.getSender(),
        {
            value: toNano('0.01'),
        },
        null, // empty message, handled by `receive()` without parameters
    );

    // create proposal
    const currentTime = BigInt(Math.floor(Date.now() / 1000));
    const proposalDeploy = await proposalMaster.send(
        masterDeployer.getSender(),
        {
            value: toNano('0.1'),
            bounce: false,
        },
        {
            $$type: 'DeployNewProposal',
            votingEndingAt: currentTime + 24n * 60n * 60n,
        },
    );

    // vote
    const proposal = blockchain.openContract(
        await Proposal.fromInit({
            $$type: 'ProposalInit',
            master: proposalMaster.address,
            proposalId: 0n,
        }),
    );
    
    for (let i = 0; i < 70; i++) {
        await vote(blockchain, proposal, 'voter'+i, true);
    }
    for (let i = 0; i < 70; i++) {
        await vote(blockchain, proposal, 'voterNO'+i, false);
    }

    // the vote was counted
    expect(await proposal.getProposalState()).toMatchObject({ yesCount: 70n, noCount:30n });
});


it('solution2_4', async () => {
    const blockchain = await Blockchain.create();

    // init master contract
    const proposalMaster = blockchain.openContract(
        await ProposalMaster.fromInit(),
    );

    // deploy master contract
    const masterDeployer = await blockchain.treasury('deployer');
    const masterDeploy = await proposalMaster.send(
        masterDeployer.getSender(),
        {
            value: toNano('0.01'),
        },
        null, // empty message, handled by `receive()` without parameters
    );

    // create proposal
    const currentTime = BigInt(Math.floor(Date.now() / 1000));
    blockchain.now = Number(currentTime);
    const proposalDeploy = await proposalMaster.send(
        masterDeployer.getSender(),
        {
            value: toNano('0.1'),
            bounce: false,
        },
        {
            $$type: 'DeployNewProposal',
            votingEndingAt: currentTime,
        },
    );

    // vote
    const proposal = blockchain.openContract(
        await Proposal.fromInit({
            $$type: 'ProposalInit',
            master: proposalMaster.address,
            proposalId: 0n,
        }),
    );

    for (let i = 0; i < 70; i++) {
        await vote(blockchain, proposal, 'voter'+i, true);
    }
    //sleep 1 seconds
    blockchain.now = Number(currentTime)+1;
    for (let i = 0; i < 70; i++) {
        await vote(blockchain, proposal, 'voterNO'+i, false);
    }
    //console.log(result);

    // the vote was counted
    expect(await proposal.getProposalState()).toMatchObject({ yesCount: 70n, noCount: 0n });
});


