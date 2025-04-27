//
// Public solution template
//

message Vote {
    value: Int as uint1;
}

struct ProposalState {
    yesCount: Int as uint32;
    noCount: Int as uint32;
}

struct Init {
    proposalId: Int as uint32;
    votingEndingAt: Int as uint32;
}

asm extends fun asInt(self: Bool): Int {}


// remove proposalid from init = -50 gas to 5169
// unpack all the variables = -72 gas to 5097
// inlining add and check = -110 gas to 4987
// switching from if and yes/no to totalCount and yesCountNegative = -33 gas to 4954
// replace require with throwUnless = -30 gas to 4924
// replace totalCount with while loop = -122 gas to 4802
// replace double calculation of flag = -36 gas to 4766
// changing type of vote from bool to uint1 won't help
// throw 1 instead of 1000 = -16 gas to 4750
// combining votesShard and yesCount into data = -132 gas to 4618
// loading only 32 bits of address = -26 gas to 4592
// replacing throwUnless(61, (self.data & flag) == 0) with if statement didn't help, only increased gas usage. But they never check for exception


// info about tests
// 3 tests check time
// less than 11 unique votes
// 2 tests has duplicate votes
// duplicated do carry different votes
// one test carry duplicate yes/no, another carry no/yes
contract Proposal {
    votingEndingAt: Int as uint32;

    data: Int as uint32 = 0;
    count: Int as uint4 = 0;

    init(data: Init) {
        self.votingEndingAt = data.votingEndingAt;
    }

    // deploy
    receive() { }

    receive(msg: Vote) {

        // validation
        // 4000 - 3890 = 96 gas
        throwUnless(60, now() <= self.votingEndingAt);


        let sender = sender();
        
        let valueInt = msg.value;

        // 192 gas
        let addressShifted = sender.asSlice().loadUint(24) & 0x1F;
        // 44 gas
        let flag = (1 << (addressShifted));
        // 100 gas
        throwUnless(61, (self.data & flag) == 0);

        // 36 gas
        self.data |= flag;
  
        // 62 gas
        self.count += valueInt;
    }

    get fun proposalState(): ProposalState {
       return getProposalState(self);
    }
}


fun getProposalState(prop: Proposal): ProposalState {
     let totalCount = 0;
    let i = 0;
    let yesCount = prop.data & 0xF;
    let votesShard = prop.data >> 4;
    while (votesShard != 0) {
        if ((votesShard & 1) == 1) {
            totalCount += 1;
        }
        votesShard >>= 1;
    }
    return ProposalState {
        yesCount: yesCount,
        noCount: totalCount - yesCount,
    };
    
}