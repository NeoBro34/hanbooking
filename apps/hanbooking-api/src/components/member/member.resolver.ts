import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { MemberService } from './member.service';
import { Member } from '../../libs/dto/member/member';
import { LoginInput, MemberInput } from '../../libs/dto/member/member.input';

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
}
