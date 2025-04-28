import '@ton/test-utils';
import { Blockchain, printTransactionFees } from '@ton/sandbox';
import { toNano, beginCell, Cell } from '@ton/core';
import {compileFunc, compilerVersion} from '@ton-community/func-js';
import { Proposal } from '../output/solution3_Proposal';
import fs from 'fs';

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
    var proposal = blockchain.openContract(
        await Proposal.fromInit({
            $$type: 'Init',
            proposalId: 0n,
            votingEndingAt: BigInt(Math.floor(Date.now() / 1000)) + 24n * 60n * 60n,
        }),
    );


    console.log("code base64 ", proposal.init?.code?.toBoc({ idx: false }).toString('base64'))

    // deploy contract
    const deployer = await blockchain.treasury('deployer');
    const deployResult = await proposal.send(
        deployer.getSender(),
        {
            value: toNano('0.01'),
        },
        null, // empty message, handled by `receive()` without parameters
    );
    //console.log(deployResult);

    const TRUE = 1;
    const FALSE = 0;

    // vote
    const voter = await blockchain.treasury('voter');
    const voteResult = await proposal.send(
        voter.getSender(),
        { value: toNano('0.1') },
        {
            $$type: 'Vote',
            value: false,
        },
    );
    await proposal.send(
        (await blockchain.treasury('voter2')).getSender(),
        { value: toNano('0.1') },
        {
            $$type: 'Vote',
            value: false,
        },
    );


//    console.log("voteResult", voteResult)



    console.log("code base64 after update ", proposal.init?.code?.toBoc({ idx: false }).toString('base64'))

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
    expect(await proposal.getProposalState()).toMatchObject({ yesCount: 0n, noCount: 2n });
});

it('compile_handcrafted_code', async () => {
    // You can get compiler version 
    let version = await compilerVersion();
    
    // Read the Fift file
    const funCCode = fs.readFileSync('/Users/lobster/Documents/ton/tact-smart-battle/output/solution3_Proposal_handcrafted.fc', 'utf-8');
    const stdlibCode = fs.readFileSync('/Users/lobster/Documents/ton/tact-smart-battle/output/stdlib.fc', 'utf-8');
    
    let result = await compileFunc({
        // Targets of your project
        targets: ['solution3_Proposal_handcrafted.fc'],
        // Sources
        sources: {
            "solution3_Proposal_handcrafted.fc": '#include "stdlib.fc";\n' + funCCode,
            "stdlib.fc": stdlibCode,
            // The rest of the files which are included in main.fc if any
        }
    });

    if (result.status === 'error') {
        console.error(result.message)
        return;
    }

    // result.codeBoc contains base64 encoded BOC with code cell 
    let codeCell = Cell.fromBoc(Buffer.from(result.codeBoc, "base64"))[0];
    

    let codeSlice = codeCell.asSlice();
    // result.fiftCode contains assembly version of your code (for debug purposes)
    /*console.log("codeCell  base ", codeSlice);
    console.log("codeSlice.remainingRefs", codeSlice.remainingRefs);
    console.log("codeCell", codeSlice.preloadMaybeRef());
    console.log("codeCell", codeSlice.preloadMaybeRef()?.refs);*/
    console.log("result.codeBoc", result.codeBoc);
    //console.log(result.fiftCode)
});
//*/
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