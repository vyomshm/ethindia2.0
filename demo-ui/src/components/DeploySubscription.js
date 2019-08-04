import React from 'react';
import { Button, Form, FormGroup, Label, Input, FormText, Card, CardImg, CardText, CardBody,
    CardTitle, CardSubtitle } from 'reactstrap';


class DeploySubscription extends React.Component {
    handleChange = async (event) => {
        const { target } = event;
        const value = target.type === 'checkbox' ? target.checked : target.value;
        const { name } = target;
        await this.setState({
          [ name ]: value,
        });
    }

    submitForm = async (e) => {
        e.preventDefault();
        // console.log(`Email: ${ this.state.email }`)
        console.log(this.state);
        const {subscription, symbol, amount} = this.state;
        let res = await this.props.deployContract(subscription, symbol, amount, this.props.account);

    }

    render() {
        return (
            <Card style={{padding: '20px', margin:'auto', maxHeight:'50vh', maxWidth:'50vw'}}>
                <h1 ><b> Configure </b></h1>
                <Form onSubmit={ (e) => this.submitForm(e) }>
                    <FormGroup>
                        <Label for="Subscription">Name</Label>
                        <Input 
                            type="text" 
                            name="subscription" 
                            id="subscriptionName" 
                            placeholder="Name of your subscription" 
                            onChange={(e) => this.handleChange(e)} 
                        />
                    </FormGroup>
                    <FormGroup>
                        <Label for="Symbol">Symbol</Label>
                        <Input 
                            type="text" 
                            name="symbol" 
                            id="symbol" 
                            placeholder="Symbol of your token" 
                            onChange={(e) => this.handleChange(e)}
                        />
                    </FormGroup>
                    <FormGroup>
                        <Label for="StackAmount">Subscription Fee Amount in DAI</Label>
                        <Input 
                            type="text" 
                            name="amount" 
                            id="stackAmount" 
                            placeholder="Minimum stack amount"
                            onChange={(e) => this.handleChange(e)} 
                        />
                    </FormGroup>
                     <FormGroup>
                        <Label for="platform">Platform Account</Label>
                        <Input 
                            type="text" 
                            name="amount" 
                            id="stackAmount" 
                            placeholder={this.props.acccount}
                            value={this.props.account}
                            onChange={(e) => this.handleChange(e)} 

                            disabled
                        />
                    </FormGroup>
                    <br />
                    <Button>Deploy Subscription Contract</Button>
                    <br />
                </Form>
            </Card>
        )
    }

}

export default DeploySubscription;
