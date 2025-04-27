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
contract Proposal {
    votingEndingAt: Int as uint32;

    data: Int as uint72 = 0;

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
        let addressShifted = sender.asSlice().loadUint(32) & 0x3F;
        // 44 gas
        let flag = (1 << (addressShifted + 8));
        // 100 gas
        throwUnless(61, (self.data & flag) == 0);

        // 36 gas
        self.data |= flag;
  
        // 62 gas
        self.data += valueInt;
    }

    get fun proposalState(): ProposalState {
        let totalCount = 0;
        let i = 0;
        let yesCount = self.data & 0xFF;
        let votesShard = self.data >> 8;
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
}
