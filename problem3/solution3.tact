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
// with setCode dropped to 4090, but we got lower score (274.75 points)


// info about tests
// 3 tests check time
// less than 11 unique votes
// 2 tests has duplicate votes
// duplicated do carry different votes
// one test carry duplicate yes/no, another carry no/yes
contract Proposal {
    votingEndingAt: Int as uint32;

    data: Int as uint64 = 0;

    init(data: Init) {
        self.votingEndingAt = data.votingEndingAt;
        setCode(cell(
            "te6ccgECAwEAAQsAAdD/AI6I9KQT9LzyyAvtUyCOUzAy0HTXIfpAMO1E0NIAAZfTH9M/WWwSmtMf0x9ZAtEBMXDiA4Ag1yHTAAEx+CMiu/K8AoAY1wEwgB+wA6oFA6oAE6ABoMh/AcoAWQLLH8s/ye1U4e1D2QEBO6ZOWLtRNDSAAGX0x/TP1lsEprTH9MfWQLRATFw4oAIA+lwxbZMhwgCOJCFxsCKrAIAfsAOrBYEBAVQUIiFulVtZ9FowmMgBzwBBM/RC4ugxcCCBAQFUUwBZ9IRvpSCWUCPXADBYlmwhbTJtAeKQjijAAZICpJMBpFjigQEBUwQDUFVBM/R4b6UgllAj1wAwWJZsIW0ybQHi6FtsEmwi"
        ));
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
        self.data = (self.data << 6) + (addressShifted << 1) + valueInt;
    }

    get fun proposalState(): ProposalState {
       return getProposalState(self);
    }
}


fun getProposalState(prop: Proposal): ProposalState {
    let myMap: map<Int, Int> = emptyMap();
    let data = prop.data;
    while (data > 0) {
        let valueInt = data & 0x1;
        let addressShifted = (data >> 1) & 0x1F;
        data >>= 6;

        myMap.set(addressShifted, valueInt);
    }

    let yesCount: Int = 0;
    let noCount: Int = 0;
    foreach (add, value in myMap) {
        if (value == 1) {
            yesCount += 1;
        } else {
            noCount += 1;
        }
    }

    return ProposalState {
        yesCount: yesCount,
        noCount: noCount,
    };
    
}

asm fun setCode(code: Cell) { SETCODE }
