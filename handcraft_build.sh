#!/bin/bash

# Compile FunC to Fift
func -o output/solution3_Proposal_handcrafted.fif -SPA stdlib.fc output/solution3_Proposal_handcrafted.fc

# Compile Fift to binary
fift -s output/solution3_Proposal_handcrafted.fif
