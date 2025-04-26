import '@ton/test-utils';
import { Blockchain } from '@ton/sandbox';
import { toNano } from '@ton/core';
import { Proposal } from '../output/solution4_Proposal';
import { ProposalMaster } from '../output/solution4_ProposalMaster';

/*
it('solution4', async () => {
    const blockchain = await Blockchain.create();

    // init master contract
    const proposalMaster = blockchain.openContract(
        await ProposalMaster.fromInit(),
    );
    console.log("master contract balance after init", await blockchain.getContract(proposalMaster.address).then(c => c.balance));


    // deploy master contract
    const masterDeployer = await blockchain.treasury('deployer');
    const masterContract = await proposalMaster.send(
        masterDeployer.getSender(),
        {
            value: toNano('0.02'),
        },
        null, // empty message, handled by `receive()` without parameters
    );
    console.log("master contract balance after 0.02", await blockchain.getContract(proposalMaster.address).then(c => c.balance));

    
    //console.log("masterContract", masterContract);

    // Get contract balance after deployment
    //const balance = await blockchain.getContract(proposalMaster.address).then(c => c.balance);
    //console.log("Contract balance:", balance);

   // console.log("master deployed");

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

    // check returned funds
    console.log("proposalDeploy", proposalDeploy);

    const votemessages = proposalDeploy.transactions.filter(
        (t) => {
            const parse = t.inMessage?.body?.beginParse();
            if (parse?.remainingBits && parse.remainingBits >= 32) {
                return parse.loadUint(32) === 2993128428;
            }
            return false;
        }
    );

    //console.log("votemessages", votemessages);
    //console.log("votemessages.totalFees", votemessages.map((t) => t.totalFees));


    // vote
    const voter = await blockchain.treasury('voter');
    const proposal = blockchain.openContract(
        await Proposal.fromInit({
            $$type: 'ProposalInit',
            master: proposalMaster.address,
            proposalId: 0n,
        }),
    );
    await proposal.send(
        voter.getSender(),
        { value: toNano('0.1') },
        {
            $$type: 'Vote',
            value: true,
        },
    );

    // the vote was counted
    expect(await proposal.getProposalState()).toMatchObject({ yesCount: 1n, noCount: 0n });

    console.log("master contract balance", await blockchain.getContract(proposalMaster.address).then(c => c.balance));
    console.log("proposal contract balance", await blockchain.getContract(proposal.address).then(c => c.balance));
});
//*/



it('solution4_2', async () => {
    const blockchain = await Blockchain.create();

    // init master contract
    const proposalMaster = blockchain.openContract(
        await ProposalMaster.fromInit(),
    );
    console.log("master contract balance after init", await blockchain.getContract(proposalMaster.address).then(c => c.balance));


    // deploy master contract
    const masterDeployer = await blockchain.treasury('deployer');
    /*const masterContract = await proposalMaster.send(
        masterDeployer.getSender(),
        {
            value: toNano('0.002'),
        },
        null, // empty message, handled by `receive()` without parameters
    );
    console.log("master contract balance after 0.002 top up", await blockchain.getContract(proposalMaster.address).then(c => c.balance));
*/
    
    // deploy master contract
    const masterContract2 = await proposalMaster.send(
        masterDeployer.getSender(),
        {
            value: toNano('1.0'),
        },
        null, // empty message, handled by `receive()` without parameters
    );
    console.log("master contract balance after 1.0 top up", await blockchain.getContract(proposalMaster.address).then(c => c.balance));


    //(await blockchain.getContract(proposalMaster.address)).balance = 0n;

    //console.log("master contract balance after set to 0", await blockchain.getContract(proposalMaster.address).then(c => c.balance));

    
    //console.log("masterContract", masterContract);

    // Get contract balance after deployment
    //const balance = await blockchain.getContract(proposalMaster.address).then(c => c.balance);
    //console.log("Contract balance:", balance);

   // console.log("master deployed");

    // create proposal
    const currentTime = BigInt(Math.floor(Date.now() / 1000));
    const proposalDeploy = await proposalMaster.send(
        masterDeployer.getSender(),
        {
            value: toNano('0.002'),
            bounce: false,
        },
        {
            $$type: 'DeployNewProposal',
            votingEndingAt: currentTime + 24n * 60n * 60n,
        },
    );

    console.log("master contract balance after DeployNewProposal", await blockchain.getContract(proposalMaster.address).then(c => c.balance));
    console.log("proposalDeploy", proposalDeploy);

    // check returned funds
    //console.log("proposalDeploy", proposalDeploy);

    const votemessages = proposalDeploy.transactions.filter(
        (t) => {
            const parse = t.inMessage?.body?.beginParse();
            if (parse?.remainingBits && parse.remainingBits >= 32) {
                return parse.loadUint(32) === 2993128428;
            }
            return false;
        }
    );

    //console.log("votemessages", votemessages);
    //console.log("votemessages.totalFees", votemessages.map((t) => t.totalFees));


    // vote
    const voter = await blockchain.treasury('voter');
    const proposal = blockchain.openContract(
        await Proposal.fromInit({
            $$type: 'ProposalInit',
            master: proposalMaster.address,
            proposalId: 0n,
        }),
    );
    await proposal.send(
        voter.getSender(),
        { value: toNano('0.1') },
        {
            $$type: 'Vote',
            value: true,
        },
    );
    await proposal.send(
        voter.getSender(),
        { value: toNano('11.1') },
        {
            $$type: 'Vote',
            value: false,
        },
    );

    // the vote was counted
    expect(await proposal.getProposalState()).toMatchObject({ yesCount: 1n, noCount: 0n });

    console.log("master contract balance", await blockchain.getContract(proposalMaster.address).then(c => c.balance));
    console.log("proposal contract balance", await blockchain.getContract(proposal.address).then(c => c.balance));
});
//*/

/*
// no gas test
it('solution4_3', async () => {
    const blockchain = await Blockchain.create();

    // init master contract
    const proposalMaster = blockchain.openContract(
        await ProposalMaster.fromInit(),
    );
    console.log("master contract balance after init", await blockchain.getContract(proposalMaster.address).then(c => c.balance));


    // deploy master contract
    const masterDeployer = await blockchain.treasury('deployer');

    // create proposal
    const currentTime = BigInt(Math.floor(Date.now() / 1000));
    const proposalDeploy = await proposalMaster.send(
        masterDeployer.getSender(),
        {
            value: toNano('0.001'),
            bounce: false,
        },
        {
            $$type: 'DeployNewProposal',
            votingEndingAt: currentTime + 24n * 60n * 60n,
        },
    );

    console.log("master contract balance after DeployNewProposal", await blockchain.getContract(proposalMaster.address).then(c => c.balance));
    console.log("proposalDeploy", proposalDeploy);


    // check returned funds
    //console.log("proposalDeploy", proposalDeploy);

    const votemessages = proposalDeploy.transactions.filter(
        (t) => {
            const parse = t.inMessage?.body?.beginParse();
            if (parse?.remainingBits && parse.remainingBits >= 32) {
                return parse.loadUint(32) === 2993128428;
            }
            return false;
        }
    );

    //console.log("votemessages", votemessages);
    //console.log("votemessages.totalFees", votemessages.map((t) => t.totalFees));


    // vote
    const voter = await blockchain.treasury('voter');
    const proposal = blockchain.openContract(
        await Proposal.fromInit({
            $$type: 'ProposalInit',
            master: proposalMaster.address,
            proposalId: 0n,
        }),
    );
    await proposal.send(
        voter.getSender(),
        { value: toNano('0.1') },
        {
            $$type: 'Vote',
            value: true,
        },
    );
    await proposal.send(
        voter.getSender(),
        { value: toNano('11.1') },
        {
            $$type: 'Vote',
            value: false,
        },
    );


    console.log("getNextProposalId", await proposalMaster.getNextProposalId());
    expect(await proposalMaster.getNextProposalId()).toBe(0n);

    // the vote was counted
    expect(await proposal.getProposalState()).toMatchObject({ yesCount: 1n, noCount: 0n });

    console.log("master contract balance", await blockchain.getContract(proposalMaster.address).then(c => c.balance));
    console.log("proposal contract balance", await blockchain.getContract(proposal.address).then(c => c.balance));
});
//*/
