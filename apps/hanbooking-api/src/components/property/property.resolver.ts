import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { PropertyService } from './property.service';
import { Roles } from '../auth/decorators/roles.decorator';
import { MemberType } from '../../libs/enums/member.enum';
import { UseGuards } from '@nestjs/common';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Properties, Property } from '../../libs/dto/property/property';
import { AgentPropertiesInquiry, OrdinaryInquiry, PropertiesInquiry, PropertyInput } from '../../libs/dto/property/property.input';
import { AuthMember } from '../auth/decorators/authMember.decorator';
import mongoose from 'mongoose';
import { WithoutGuard } from '../auth/guards/without.guard';
import { PropertyUpdate } from '../../libs/dto/property/property.update';
import { shapeIntoMongoObjectId } from '../../libs/config';
import { AuthGuard } from '../auth/guards/auth.guard';

@Resolver()
export class PropertyResolver {
    constructor(private readonly propertyService: PropertyService) {}

    /** createProperty **/
    @Roles(MemberType.AGENT)
    @UseGuards(RolesGuard)
    @Mutation(() => Property)
    public async createProperty(
        @Args('input') input: PropertyInput, 
        @AuthMember('_id') memberId: mongoose.ObjectId
    ): Promise<Property> {
        console.log('Mutation: createProperty');
        input.memberId = memberId;

        return await this.propertyService.createProperty(input);
    }

    /** getProperty **/
    @UseGuards(WithoutGuard)
    @Query((returns) => Property)
    public async getProperty(
        @Args('propertyId') input: string, 
        @AuthMember('_id') memberId: mongoose.ObjectId
    ): Promise<Property> {
        console.log('Query: getProperty');
        const propertyId = shapeIntoMongoObjectId(input);

        return await this.propertyService.getProperty(memberId, propertyId);
    }

    /** updateProperty **/
    @Roles(MemberType.AGENT)
    @UseGuards(RolesGuard)
    @Mutation(( returns ) => Property)
    public async updateProperty(
        @Args('input') input: PropertyUpdate,
        @AuthMember('_id') memberId: mongoose.ObjectId
    ): Promise<Property> {
        console.log('Mutation: updateProperty');
        input._id = shapeIntoMongoObjectId(input._id);

        return await this.propertyService.updateProperty(memberId, input);
    }

    /** getProperties **/
    @UseGuards(WithoutGuard)
    @Query(( returns ) => Properties)
    public async getProperties(
        @Args('input') input: PropertiesInquiry,
        @AuthMember('_id') memberId: mongoose.ObjectId,
    ): Promise<Properties> {
        console.log('Query: getProperties');
        return await this.propertyService.getProperties(memberId, input);
    }

    /** getFavorites **/
    @UseGuards(AuthGuard)
    @Query(( returns ) => Properties)
    public async getFavorites(
        @Args('input') input: OrdinaryInquiry,
        @AuthMember('_id') memberId: mongoose.ObjectId,
    ): Promise<Properties> {
        console.log('Query: getFavorites');
        return await this.propertyService.getFavorites(memberId, input);
    }
    
    /** getVisited **/
    @UseGuards(AuthGuard)
    @Query(( returns ) => Properties)
    public async getVisited(
        @Args('input') input: OrdinaryInquiry,
        @AuthMember('_id') memberId: mongoose.ObjectId,
    ): Promise<Properties> {
        console.log('Query: getVisited');
        return await this.propertyService.getVisited(memberId, input);
    }

    /** getAgentProperties **/
    @Roles(MemberType.AGENT)
    @UseGuards(RolesGuard)
    @Query(( returns ) => Properties)
    public async getAgentProperties(
        @Args('input') input: AgentPropertiesInquiry,
        @AuthMember('_id') memberId: mongoose.ObjectId,
    ): Promise<Properties> {
        console.log('Query: getAgentProperties');
        return await this.propertyService.getAgentProperties(memberId, input);
    }

    /** likeTargetProperty **/
    @UseGuards(AuthGuard)
    @Mutation(() => Property)
    public async likeTargetProperty(
        @Args('propertyId') input: string, 
        @AuthMember('_id') memberId: mongoose.ObjectId
    ): Promise<Property> {
        console.log('Mutation: likeTargetProperty');
        const likeRefId = shapeIntoMongoObjectId(input);
        return await this.propertyService.likeTargetProperty(memberId, likeRefId);
    }
}
