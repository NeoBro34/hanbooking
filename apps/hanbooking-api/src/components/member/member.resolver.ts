import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { MemberService } from './member.service';
import { Member, Members } from '../../libs/dto/member/member';
import { AgentsInquiry, LoginInput, MemberInput } from '../../libs/dto/member/member.input';
import {  UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/guards/auth.guard';
import { AuthMember } from '../auth/decorators/authMember.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { MemberType } from '../../libs/enums/member.enum';
import { RolesGuard } from '../auth/guards/roles.guard';
import { MemberUpdate } from '../../libs/dto/member/member.update';
import mongoose from 'mongoose';
import { WithoutGuard } from '../auth/guards/without.guard';
import { shapeIntoMongoObjectId } from '../../libs/config';

@Resolver()
export class MemberResolver {
    constructor(private readonly memberService: MemberService) {}

    /** signup **/
    @Mutation(() => Member)
    public async signup(
        @Args('input') input: MemberInput
    ): Promise<Member> {
        console.log('Mutation: signup');
        return await this.memberService.signup(input);
    }

    /** login **/
    @Mutation(() => Member)
    public async login(
        @Args('input') input: LoginInput
    ): Promise<Member> {
        console.log('Mutation: login');
        return await this.memberService.login(input);
    }

    /** checkAuth **/
    @UseGuards(AuthGuard)
    @Query(() => String)
    public async checkAuth(
        @AuthMember('memberNick') memberNick: string
    ): Promise<string> {
        console.log('Mutation: checkAuth');
        console.log('memberNick:',memberNick);
        return await `Hi ${memberNick}`;
    }

    /** checkAuthRoles **/
    @Roles(MemberType.USER, MemberType.AGENT)
    @UseGuards(RolesGuard)
    @Query(() => String)
    public async checkAuthRoles(
        @AuthMember() autmember: Member
    ): Promise<string> {
        console.log('Mutation: checkAuthRoles');
        return await `Hi ${autmember.memberNick}, you are ${autmember.memberType} (memberId: ${autmember._id})`;
    }

    /** updateMember **/
    @UseGuards(AuthGuard)
    @Mutation(() => Member)
    public async updateMember(
        @Args('input') input: MemberUpdate, 
        @AuthMember('_id') memberId: mongoose.ObjectId
    ): Promise<Member> {
        console.log('Mutation: updateMember');

        delete input._id;
        return await this.memberService.updateMember(memberId, input);
    }

    /** getMember **/
    @UseGuards(WithoutGuard)
    @Query(() => Member)
    public async getMember(
        @Args('memberId') input: string, 
        @AuthMember('_id') memberId: mongoose.ObjectId
    ): Promise<Member> {
        console.log('Query: getMember');

        const targetId = shapeIntoMongoObjectId(input);

        return await this.memberService.getMember(memberId, targetId);
    }

    /** getAgents **/
    @UseGuards(WithoutGuard)
    @Query(() => Members)
    public async getAgents(
        @Args('input') input: AgentsInquiry, 
        @AuthMember('_id') memberId: mongoose.ObjectId
    ): Promise<Members> {
        console.log('Query: getAgents');
        return await this.memberService.getAgents(memberId, input);
    }

    @UseGuards(AuthGuard)
    @Mutation(() => Member)
    public async likeTargetMember(
        @Args('memberId') input: string, 
        @AuthMember('_id') memberId: mongoose.ObjectId
    ): Promise<Member> {
        console.log('Mutation: likeTargetMember');
        const likeRefId = shapeIntoMongoObjectId(input);
        return await this.memberService.likeTargetMember(memberId, likeRefId);
    }
}
