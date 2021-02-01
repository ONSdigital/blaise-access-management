import React, {ChangeEvent, Component} from "react";

interface Props {
    label?: string
    id?: string
    password?: boolean
    onChange?: (e: ChangeEvent<HTMLInputElement>, ...args: any[]) => void
    placeholder?: string
    fit?: boolean
    autoFocus?: boolean
    value?: string
    autoComplete?: string
    onClick?: any
}

export class ONSTextInput extends Component <Props> {
    value = "";

    constructor(props: Props) {
        super(props);
        this.state = {value: ""};
    }

    handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (this.props.onChange !== undefined) this.props.onChange(e, this.props.label);
        
        this.value = e.target.value;
    };

    render() {
        return (
            <p className="field">
                {this.props.label !== undefined && <label className="label" htmlFor={this.props.id}>{this.props.label}</label>}
                <input value={this.props.value}
                       style={{width: this.props.fit === true ? "unset" : ""}}
                       autoFocus={this.props.autoFocus === true}
                       autoComplete={this.props.autoComplete}
                       type={this.props.password === true ? "password" : "text"}
                       id={this.props.id}
                       className={"input input--text input-type__input "}
                       placeholder={this.props.placeholder}
                       onChange={(e) => this.handleChange(e)}
                       onClick={(e) => (this.props.onClick !== undefined && this.props.onClick(e))}
                       data-testid="text-input"/>
            </p>
        );
    }
}
