//
// Public solution template
//

message Vote {
    value: Bool;
}

struct ProposalState {
    yesCount: Int as uint32;
    noCount: Int as uint32;
}

struct Init {
    proposalId: Int as uint32;
    votingEndingAt: Int as uint32;
}

struct Storage {
    // possible replace with an array
    //votes: map<Int as uint12, Bool>;

    votesShard: Int as uint64 = 0;
    
    // should be uint7
    yesCount: Int as uint7 = 0;
    noCount: Int as uint7 = 0;
}

extends mutates fun add(self: Storage, address: Int ) {
    self.votesShard |= (1 << address);
}

extends fun check(self: Storage, address: Int): Bool {
    return (self.votesShard & (1 << address)) != 0;
}

contract Proposal {
    data: Init;
    storage: Storage;

    init(data: Init) {
        self.data = data;
        self.storage = Storage {
        };
    }

    // deploy
    receive() { }

    receive(msg: Vote) {
            
        // validation
        // 4000 - 3890 = 110 gas
        require(now() <= self.data.votingEndingAt, "Voting has ended");


        // inline function = 62


        let sender = sender();
        let value = msg.value;
        // 4000 - 2628 = 1372 gas for removed function call



        // 4000 - 3923 = 77 gas
        let addressShifted = sender.asSlice().loadUint(256) >> (256-32) & 0x3F;
        //dump(addressShifted);
        // 4000 - 3784 = 216 gas
       //require(!self.storage.votes.exists(addressShifted), "Cannot vote twice");
       require(!self.storage.check(addressShifted), "Cannot vote twice");

        // 4000 - 3184 = 816 gas
        self.storage.add(addressShifted);
        // 4000 - 3888 = 112 gas
        if (value) {
            self.storage.yesCount += 1;
        } else {
            self.storage.noCount += 1;
        }
    }

    get fun proposalState(): ProposalState {
        return ProposalState {
            yesCount: self.storage.yesCount,
            noCount: self.storage.noCount,
        };
    }
}
